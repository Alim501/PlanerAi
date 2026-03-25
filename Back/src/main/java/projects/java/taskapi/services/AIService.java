package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import projects.java.taskapi.models.dto.ai.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public GeneratedPlanDTO generatePlan(GeneratePlanRequestDTO request, List<NoteContextDTO> availableNotes) {
        String url = aiServiceUrl + "/api/ai/plans/generate";

        Map<String, Object> body = new HashMap<>();
        body.put("subject", request.subject());
        body.put("duration_weeks", request.durationWeeks());
        body.put("level", request.level() != null ? request.level() : "intermediate");
        body.put("topics", request.topics() != null ? request.topics() : List.of());
        body.put("goals", request.goals() != null ? request.goals() : "");
        if (availableNotes != null && !availableNotes.isEmpty()) {
            body.put("available_notes", availableNotes);
        }

        try {
            log.info("Calling AI service: POST {} (notes={})", url, availableNotes != null ? availableNotes.size() : 0);
            return restTemplate.postForObject(url, buildRequest(body), GeneratedPlanDTO.class);
        } catch (RestClientException e) {
            log.error("AI service error (generatePlan): {}", e.getMessage());
            throw new RuntimeException("Failed to generate plan: " + e.getMessage(), e);
        }
    }

    public NoteAnalysisDTO analyzeNote(String presignedUrl, String fileType) {
        String url = aiServiceUrl + "/api/ai/notes/analyze";

        Map<String, Object> body = Map.of(
                "file_url", presignedUrl,
                "file_type", fileType
        );

        try {
            log.info("Calling AI service: POST {}", url);
            return restTemplate.postForObject(url, buildRequest(body), NoteAnalysisDTO.class);
        } catch (RestClientException e) {
            log.error("AI service error (analyzeNote): {}", e.getMessage());
            throw new RuntimeException("Failed to analyze note: " + e.getMessage(), e);
        }
    }

    public TaskImprovementDTO improveTask(ImproveTaskRequestDTO request) {
        String url = aiServiceUrl + "/api/ai/tasks/improve";

        Map<String, Object> body = Map.of(
                "task_title", request.taskTitle(),
                "task_description", request.taskDescription() != null ? request.taskDescription() : "",
                "subject", request.subject()
        );

        try {
            log.info("Calling AI service: POST {}", url);
            return restTemplate.postForObject(url, buildRequest(body), TaskImprovementDTO.class);
        } catch (RestClientException e) {
            log.error("AI service error (improveTask): {}", e.getMessage());
            throw new RuntimeException("Failed to improve task: " + e.getMessage(), e);
        }
    }

    public AIHealthDTO checkHealth() {
        String url = aiServiceUrl + "/health";
        try {
            return restTemplate.getForObject(url, AIHealthDTO.class);
        } catch (RestClientException e) {
            log.warn("AI service unavailable: {}", e.getMessage());
            return new AIHealthDTO("unavailable", false, "unknown", "unknown");
        }
    }

    private HttpEntity<Map<String, Object>> buildRequest(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
