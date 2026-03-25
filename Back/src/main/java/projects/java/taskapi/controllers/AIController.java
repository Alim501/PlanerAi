package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.exceptions.NoteNotFoundException;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.dto.ai.*;
import projects.java.taskapi.services.AIService;
import projects.java.taskapi.services.FileService;
import projects.java.taskapi.services.NoteMatchingService;
import projects.java.taskapi.services.NoteService;
import projects.java.taskapi.services.PlanService;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI", description = "AI-powered educational features")
public class AIController {

    private final AIService aiService;
    private final PlanService planService;
    private final NoteService noteService;
    private final FileService fileService;
    private final NoteMatchingService noteMatchingService;

    /**
     * Генерирует план через ИИ и сохраняет его в БД.
     * Автоматически подбирает конспекты пользователя по указанным темам
     * и передаёт их ИИ как приоритетные ресурсы.
     */
    @Operation(summary = "Generate and save study plan using AI (auto-selects matching notes)")
    @PostMapping("/plans/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Plan> generatePlan(
            @AuthenticationPrincipal User currentUser,
            @RequestBody GeneratePlanRequestDTO request
    ) {
        log.info("User {} generating AI plan for subject: {}", currentUser.getId(), request.subject());

        List<NoteContextDTO> relevantNotes = noteMatchingService.findRelevantNotes(
                request.topics(), request.subjectId(), currentUser.getId()
        );

        GeneratedPlanDTO generated = aiService.generatePlan(request, relevantNotes);
        Plan saved = planService.createPlanFromGenerated(currentUser.getId(), generated);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Analyze note using AI and save results")
    @PostMapping("/notes/analyze")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NoteAnalysisDTO> analyzeNote(
            @RequestBody AnalyzeNoteRequestDTO request
    ) {
        Note note = noteService.getNoteById(request.noteId())
                .orElseThrow(() -> new NoteNotFoundException(request.noteId()));

        String fileType = note.getFormat().name().toLowerCase();
        String presignedUrl = fileService.generatePresignedUrl(note.getFileUrl());
        log.info("Analyzing note id={}, fileType={}", note.getId(), fileType);

        NoteAnalysisDTO analysis = aiService.analyzeNote(presignedUrl, fileType);
        noteService.applyAnalysis(note.getId(), analysis);
        return ResponseEntity.ok(analysis);
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
