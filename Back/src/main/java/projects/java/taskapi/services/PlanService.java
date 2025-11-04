package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import projects.java.taskapi.exceptions.NoteNotFoundException;
import projects.java.taskapi.exceptions.PlanNotFoundException;
import projects.java.taskapi.exceptions.SubjectNotFoundException;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.*;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.repositories.PlanRepository;
import projects.java.taskapi.repositories.ProgressRepository;
import projects.java.taskapi.repositories.SubjectRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository studyPlanRepository;
    private final ProgressRepository userPlanProgressRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final PlanRepository planRepository;

    public Plan createPlan(Long userId, PlanDTO dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Subject subject = subjectRepository.findById(dto.subjectId())
                .orElseThrow(() -> new SubjectNotFoundException(dto.subjectId()));

        Plan plan = Plan.builder()
                .title(dto.title())
                .subject(subject)
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

    public Plan updatePlan(Long id, PlanDTO dto) {
        return studyPlanRepository.findById(id)
                .map(plan -> {
                    plan.setTitle(dto.title());
                    plan.setSubject(
                            subjectRepository.findById(dto.subjectId())
                                    .orElseThrow(() -> new SubjectNotFoundException(dto.subjectId())));
                    plan.setStartDate(dto.startDate());
                    plan.setEndDate(dto.endDate());
                    return studyPlanRepository.save(plan);
                })
                .orElseThrow(() -> new PlanNotFoundException(id));
    }

    public void deletePlan(Long planId) {
        studyPlanRepository.deleteById(planId);
    }

    public List<Plan> searchPlans(String title, Long subjectId) {
        if (title != null && subjectId != null) {
            return studyPlanRepository.findByTitleContainingIgnoreCaseAndSubjectId(title, subjectId);
        } else if (title != null) {
            return studyPlanRepository.findByTitleContainingIgnoreCase(title);
        } else if (subjectId != null) {
            return studyPlanRepository.findBySubjectId(subjectId);
        } else {
            return studyPlanRepository.findAll();
        }
    }
}

