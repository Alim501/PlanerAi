package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.exceptions.PlanNotFoundException;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.services.PlanService;

import java.util.List;

@RestController
@RequestMapping("api/plans")
@RequiredArgsConstructor
@Tag(name = "Plans", description = "Study plan management")
public class PlanController {

    private final PlanService studyPlanService;

    @Operation(summary = "Создать новый учебный план с неделями и задачами")
    @PostMapping
    public Plan createPlan(@AuthenticationPrincipal User currentUser,
                           @RequestBody PlanDTO planDto) {
        return studyPlanService.createPlan(currentUser.getId(), planDto);
    }

    @Operation(summary = "Получить все планы пользователя по его ID")
    @GetMapping("/user/{userId}")
    public List<Plan> getPlansByUser(@PathVariable Long userId) {
        return studyPlanService.getPlansByUser(userId);
    }

    @Operation(summary = "Получить все планы текущего пользователя")
    @GetMapping("/my")
    public List<Plan> getMyPlans(@AuthenticationPrincipal User currentUser) {
        return studyPlanService.getPlansByUser(currentUser.getId());
    }

    @Operation(summary = "Поиск планов по названию и/или предмету")
    @GetMapping("/search")
    public List<Plan> searchPlans(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long subjectId) {
        return studyPlanService.searchPlans(title, subjectId);
    }

    @Operation(summary = "Получить план по ID")
    @GetMapping("/{id}")
    public Plan getPlan(@PathVariable Long id) {
        return studyPlanService.getPlanById(id)
                .orElseThrow(() -> new PlanNotFoundException(id));
    }

    @Operation(summary = "Обновить шаблон плана (title, subject, description, difficulty) по ID")
    @PutMapping("/{id}")
    public Plan updatePlan(@PathVariable Long id, @RequestBody PlanDTO dto) {
        return studyPlanService.updatePlan(id, dto);
    }

    @Operation(summary = "Удалить план по ID, только MODERATOR или ADMIN")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        studyPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
