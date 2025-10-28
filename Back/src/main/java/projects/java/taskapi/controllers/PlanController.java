package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.models.Subject;
import projects.java.taskapi.services.PlanService;

import java.util.List;

@RestController
@RequestMapping("api/plans")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class PlanController {

    private final PlanService studyPlanService;

    @Operation(summary = "Создать новый учебный план")
    @PostMapping
    public Plan createPlan(@RequestBody PlanDTO planDto) {
        return studyPlanService.createPlan(planDto);
    }

    @Operation(summary = "Получить все планы пользователя по его ID")
    @GetMapping("/user/{userId}")
    public List<Plan> getPlansByUser(@PathVariable Long userId) {
        return studyPlanService.getPlansByUser(userId);
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
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    @Operation(summary = "Обновить существующий план по ID")
    @PutMapping("/{id}")
    public Plan updatePlan(@PathVariable Long id, @RequestBody Plan plan) {
        return studyPlanService.updatePlan(id, plan);
    }

    @Operation(summary = "Удалить план по ID")
    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable Long id) {
        studyPlanService.deletePlan(id);
    }
}
