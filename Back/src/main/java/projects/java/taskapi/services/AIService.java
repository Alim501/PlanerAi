package projects.java.taskapi.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import projects.java.taskapi.models.dto.ai.*;

/**
 * Service for interacting with AI microservice
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate study plan using AI
     */
    public GeneratedPlanDTO generatePlan(GeneratePlanRequestDTO request) {
        try {
            String url = aiServiceUrl + "/api/ai/plans/generate";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Convert request to match Python API format
            var aiRequest = new Object() {
                public final String subject = request.subject();
                public final int duration_weeks = request.durationWeeks();
                public final String level = request.level() != null ? request.level() : "intermediate";
                public final java.util.List<String> topics = request.topics();
                public final String goals = request.goals();
            };

            HttpEntity<Object> entity = new HttpEntity<>(aiRequest, headers);

            log.info("Calling AI service at: {}", url);
            ResponseEntity<GeneratedPlanDTO> response = restTemplate.postForEntity(
                    url,
                    entity,
                    GeneratedPlanDTO.class
            );

            log.info("AI plan generated successfully");
            return response.getBody();

        } catch (RestClientException e) {
            log.error("Error calling AI service: {}", e.getMessage());
            throw new RuntimeException("Failed to generate plan: " + e.getMessage(), e);
        }
    }

    /**
     * Analyze note using AI
     */
    public NoteAnalysisDTO analyzeNote(AnalyzeNoteRequestDTO request) {
        try {
            String url = aiServiceUrl + "/api/ai/notes/analyze";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Convert request to match Python API format
            var aiRequest = new Object() {
                public final String file_path = request.filePath();
                public final String file_type = request.fileType();
                public final Long subject_id = request.subjectId();
            };

            HttpEntity<Object> entity = new HttpEntity<>(aiRequest, headers);

            log.info("Calling AI service for note analysis: {}", url);
            ResponseEntity<NoteAnalysisDTO> response = restTemplate.postForEntity(
                    url,
                    entity,
                    NoteAnalysisDTO.class
            );

            log.info("Note analyzed successfully");
            return response.getBody();

        } catch (RestClientException e) {
            log.error("Error analyzing note: {}", e.getMessage());
            throw new RuntimeException("Failed to analyze note: " + e.getMessage(), e);
        }
    }

    /**
     * Check AI service health
     */
    public AIHealthDTO checkHealth() {
        try {
            String url = aiServiceUrl + "/health";

            log.info("Checking AI service health: {}", url);
            ResponseEntity<AIHealthDTO> response = restTemplate.getForEntity(
                    url,
                    AIHealthDTO.class
            );

            return response.getBody();

        } catch (RestClientException e) {
            log.error("AI service health check failed: {}", e.getMessage());
            return new AIHealthDTO("unavailable", false, "unknown", "unknown");
        }
    }

    /**
     * Improve task using AI
     */
    public TaskImprovementDTO improveTask(ImproveTaskRequestDTO request) {
        try {
            String url = aiServiceUrl + "/api/ai/tasks/improve";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Convert request to match Python API format
            var aiRequest = new Object() {
                public final String task_title = request.taskTitle();
                public final String task_description = request.taskDescription();
                public final String subject = request.subject();
            };

            HttpEntity<Object> entity = new HttpEntity<>(aiRequest, headers);

            log.info("Calling AI service for task improvement: {}", url);
            ResponseEntity<TaskImprovementDTO> response = restTemplate.postForEntity(
                    url,
                    entity,
                    TaskImprovementDTO.class
            );

            log.info("Task improved successfully");
            return response.getBody();

        } catch (RestClientException e) {
            log.error("Error improving task: {}", e.getMessage());
            throw new RuntimeException("Failed to improve task: " + e.getMessage(), e);
        }
    }
}
