package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.dto.ai.*;
import projects.java.taskapi.services.AIService;

/**
 * Controller for AI-powered features
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI", description = "AI-powered educational features")
public class AIController {

    private final AIService aiService;

    @Operation(summary = "Generate study plan using AI")
    @PostMapping("/plans/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GeneratedPlanDTO> generatePlan(
            @RequestBody GeneratePlanRequestDTO request
    ) {
        log.info("Generating AI plan for subject: {}", request.subject());
        GeneratedPlanDTO plan = aiService.generatePlan(request);
        return ResponseEntity.ok(plan);
    }

    @Operation(summary = "Analyze note using AI")
    @PostMapping("/notes/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NoteAnalysisDTO> analyzeNote(
            @RequestBody AnalyzeNoteRequestDTO request
    ) {
        log.info("Analyzing note: {}", request.filePath());
        NoteAnalysisDTO analysis = aiService.analyzeNote(request);
        return ResponseEntity.ok(analysis);
    }

    @Operation(summary = "Check AI service health")
    @GetMapping("/health")
    public ResponseEntity<AIHealthDTO> checkHealth() {
        AIHealthDTO health = aiService.checkHealth();
        return ResponseEntity.ok(health);
    }

    @Operation(summary = "Improve task description using AI")
    @PostMapping("/tasks/improve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskImprovementDTO> improveTask(
            @RequestBody ImproveTaskRequestDTO request
    ) {
        log.info("Improving task: {}", request.taskTitle());
        TaskImprovementDTO improvement = aiService.improveTask(request);
        return ResponseEntity.ok(improvement);
    }
}
