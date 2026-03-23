package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projects.java.taskapi.exceptions.FileNotFoundException;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Save file to AWS S3
     * @param file MultipartFile to upload
     * @return S3 object key (unique filename)
     */
    public String saveFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Cannot store empty file");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String fileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + extension;

            // Prepare metadata
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            // Upload to S3
            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded successfully to S3: {}", fileName);
            return fileName;

        } catch (S3Exception e) {
            log.error("S3 error while uploading file: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to upload file to S3: " + file.getOriginalFilename(), e);
        } catch (IOException e) {
            log.error("IO error while reading file: {}", e.getMessage());
            throw new RuntimeException("Failed to read file: " + file.getOriginalFilename(), e);
        }
    }

    /**
     * Load file from AWS S3
     * @param s3Key S3 object key (path)
     * @return Resource containing file data
     */
    public Resource loadFile(String s3Key) {
        try {
            // Download file from S3
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);

            // Read all bytes into memory
            byte[] fileContent = s3Object.readAllBytes();

            log.info("File downloaded successfully from S3: {}", s3Key);
            return new ByteArrayResource(fileContent);

        } catch (NoSuchKeyException e) {
            log.error("File not found in S3: {}", s3Key);
            throw new FileNotFoundException(s3Key);
        } catch (S3Exception e) {
            log.error("S3 error while downloading file: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to download file from S3: " + s3Key, e);
        } catch (IOException e) {
            log.error("IO error while reading S3 object: {}", e.getMessage());
            throw new RuntimeException("Failed to read S3 object: " + s3Key, e);
        }
    }

    /**
     * Delete file from AWS S3
     * @param s3Key S3 object key (path)
     * @return true if deleted successfully
     */
    public boolean deleteFile(String s3Key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            log.info("File deleted successfully from S3: {}", s3Key);
            return true;

        } catch (S3Exception e) {
            log.error("S3 error while deleting file: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to delete file from S3: " + s3Key, e);
        }
    }

    /**
     * Generate a presigned URL for temporary access to an S3 file
     * @param s3Key S3 object key
     * @return Presigned URL valid for 15 minutes
     */
    public String generatePresignedUrl(String s3Key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(r -> r.bucket(bucketName).key(s3Key))
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * Helper method to extract file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return lastDot == -1 ? "" : filename.substring(lastDot);
    }
}