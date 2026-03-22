package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.dto.ai.*;
import projects.java.taskapi.services.AIService;
import projects.java.taskapi.services.PlanService;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI", description = "AI-powered educational features")
public class AIController {

    private final AIService aiService;
    private final PlanService planService;

    /**
     * Генерирует план через ИИ и сохраняет его в БД.
     * Возвращает сохранённый план с ID и задачами.
     */
    @Operation(summary = "Generate and save study plan using AI")
    @PostMapping("/plans/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Plan> generatePlan(
            @AuthenticationPrincipal User currentUser,
            @RequestBody GeneratePlanRequestDTO request
    ) {
        log.info("User {} generating AI plan for subject: {}", currentUser.getId(), request.subject());
        GeneratedPlanDTO generated = aiService.generatePlan(request);
        Plan saved = planService.createPlanFromGenerated(currentUser.getId(), generated);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Analyze note using AI")
    @PostMapping("/notes/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NoteAnalysisDTO> analyzeNote(
            @RequestBody AnalyzeNoteRequestDTO request
    ) {
        log.info("Analyzing note: {}", request.filePath());
        return ResponseEntity.ok(aiService.analyzeNote(request));
    }

    @Operation(summary = "Improve task description using AI")
    @PostMapping("/tasks/improve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskImprovementDTO> improveTask(
            @RequestBody ImproveTaskRequestDTO request
    ) {
        log.info("Improving task: {}", request.taskTitle());
        return ResponseEntity.ok(aiService.improveTask(request));
    }

    @Operation(summary = "Check AI service health")
    @GetMapping("/health")
    public ResponseEntity<AIHealthDTO> checkHealth() {
        return ResponseEntity.ok(aiService.checkHealth());
    }
}
