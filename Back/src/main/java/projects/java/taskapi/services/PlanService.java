package projects.java.taskapi.services;

import io.jsonwebtoken.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.UserPlanProgress;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.models.enums.Subject;
import projects.java.taskapi.repositories.PlanRepository;
import projects.java.taskapi.repositories.ProgressRepository;
import projects.java.taskapi.repositories.TaskRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository studyPlanRepository;
    private final ProgressRepository userPlanProgressRepository;
    private final UserRepository userRepository;

    public Plan createPlan(PlanDTO dto) {

        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Plan plan = Plan.builder()
                .title(dto.title())
                .subject(dto.subject())
                .startDate(dto.startDate())
                .endDate(dto.endDate())
                .build();

        if (dto.tasks() != null && !dto.tasks().isEmpty()) {
            List<Task> tasks = dto.tasks().stream()
                    .map(taskDto -> Task.builder()
                            .title(taskDto.title())
                            .description(taskDto.description())
                            .dueDate(taskDto.dueDate())
                            .studyPlan(plan)
                            .build())
                    .toList();
            plan.setTasks(tasks);
        }

        Plan savedPlan = studyPlanRepository.save(plan);

        // Привязываем пользователя через таблицу UserPlanProgress
        UserPlanProgress progress = UserPlanProgress.builder()
                .user(user)
                .studyPlan(savedPlan)
                .progress(0.0)
                .build();

        userPlanProgressRepository.save(progress);

        return savedPlan;
    }


    public List<Plan> getPlansByUser(Long userId) {
        return userPlanProgressRepository.findPlansByUserId(userId);
    }

    public Optional<Plan> getPlanById(Long id) {
        return studyPlanRepository.findById(id);
    }

    public Plan updatePlan(Long id, Plan updatedPlan) {
        return studyPlanRepository.findById(id)
                .map(plan -> {
                    plan.setTitle(updatedPlan.getTitle());
                    plan.setStartDate(updatedPlan.getStartDate());
                    plan.setEndDate(updatedPlan.getEndDate());
                    return studyPlanRepository.save(plan);
                })
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    public void deletePlan(Long id) {
        studyPlanRepository.deleteById(id);
    }

    public List<Plan> searchPlans(String title, Subject subject) {
        if (title != null && subject != null) {
            return studyPlanRepository.findByTitleContainingIgnoreCaseAndSubject(title, subject);
        } else if (title != null) {
            return studyPlanRepository.findByTitleContainingIgnoreCase(title);
        } else if (subject != null) {
            return studyPlanRepository.findBySubject(subject);
        } else {
            return studyPlanRepository.findAll();
        }
    }
}

