package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AIHealthDTO(
        String status,
        @JsonProperty("ollama_connected") boolean ollamaConnected,
        String model,
        String version
) {
}
