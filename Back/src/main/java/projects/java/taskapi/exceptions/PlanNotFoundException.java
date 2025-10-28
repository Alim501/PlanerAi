package projects.java.taskapi.exceptions;

public class PlanNotFoundException extends RuntimeException {
    public PlanNotFoundException(Long planId) {
        super(String.format("Plan with id: %d not found", planId));
    }
}
