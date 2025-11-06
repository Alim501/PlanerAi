package projects.java.taskapi.exceptions;

public class SubjectNotFoundException extends RuntimeException {
    public SubjectNotFoundException(Long subjectId) {
        super("Subject with id: %d not found".formatted(subjectId));
    }
}
