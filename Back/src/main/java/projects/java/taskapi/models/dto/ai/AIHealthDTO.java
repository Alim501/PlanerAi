package projects.java.taskapi.models.dto.ai;

public record AIHealthDTO(
        String status,
        boolean ollamaConnected,
        String model,
        String version
) {
}
