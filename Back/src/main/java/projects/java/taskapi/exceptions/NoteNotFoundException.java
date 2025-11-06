package projects.java.taskapi.exceptions;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(Long noteId) {
        super(String.format("Note with id: %d not found", noteId));
    }
}
