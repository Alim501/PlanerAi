package projects.java.taskapi.exceptions;


public record ErrorResponse(
        String timestamp,
        int status,
        String error,
        String message
) {}
