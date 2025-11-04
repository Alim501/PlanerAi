package projects.java.taskapi.exceptions;

public class FileNotFoundException extends RuntimeException {
    public FileNotFoundException(String fileName) {
        super("File %s not found".formatted(fileName));
    }
}
