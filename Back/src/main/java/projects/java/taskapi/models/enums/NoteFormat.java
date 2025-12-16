package projects.java.taskapi.models.enums;

import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

@Getter
public enum NoteFormat {

    PDF("application/pdf", ".pdf"),
    DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"),
    PNG("image/png", ".png"),
    JPG("image/jpeg", ".jpg"),
    TXT("text/plain", ".txt");

    private final String mimeType;
    private final String extension;

    NoteFormat(String mimeType, String extension) {
        this.mimeType = mimeType;
        this.extension = extension;
    }

    public static NoteFormat fromMultipartFile(MultipartFile file) {
        String contentType = file.getContentType();

        return Arrays.stream(NoteFormat.values())
                .filter(f -> f.getMimeType().equalsIgnoreCase(contentType))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unsupported file format: " + contentType)
                );
    }
}

