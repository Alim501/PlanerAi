package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projects.java.taskapi.exceptions.PlanNotFoundException;
import projects.java.taskapi.exceptions.SubjectNotFoundException;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.*;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.models.dto.WeekDTO;
import projects.java.taskapi.models.dto.ai.GeneratedPlanDTO;
import projects.java.taskapi.models.dto.ai.WeekPlanDTO;
import projects.java.taskapi.repositories.PlanRepository;
import projects.java.taskapi.repositories.ProgressRepository;
import projects.java.taskapi.repositories.SubjectRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public Plan createPlan(Long userId, PlanDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Subject subject = subjectRepository.findById(dto.subjectId())
                .orElseThrow(() -> new SubjectNotFoundException(dto.subjectId()));

        Plan plan = buildPlan(dto.title(), dto.description(), dto.difficulty(), subject);

        if (dto.weeks() != null) {
            List<Week> weeks = dto.weeks().stream()
                    .map(weekDto -> buildWeekFromDto(plan, weekDto))
                    .toList();
            plan.setWeeks(weeks);
        }

        Plan saved = planRepository.save(plan);
        linkUserToPlan(user, saved, dto.startDate(), dto.endDate());
        return saved;
    }

    /**
     * Создаёт и сохраняет план, сгенерированный ИИ.
     * Subject ищется по имени без учёта регистра; если не найден — создаётся.
     * startDate = сегодня, endDate = startDate + durationWeeks.
     */
    @Transactional
    public Plan createPlanFromGenerated(Long userId, GeneratedPlanDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Subject subject = subjectRepository.findByNameIgnoreCase(dto.subject())
                .orElseGet(() -> subjectRepository.save(
                        Subject.builder().name(dto.subject()).build()
                ));

        Plan plan = buildPlan(dto.title(), dto.description(), dto.difficulty(), subject);

        if (dto.weeks() != null) {
            List<Week> weeks = dto.weeks().stream()
                    .map(weekDto -> buildWeekFromGenerated(plan, weekDto))
                    .toList();
            plan.setWeeks(weeks);
        }

        LocalDate startDate = LocalDate.now();
        Plan saved = planRepository.save(plan);
        linkUserToPlan(user, saved, startDate, startDate.plusWeeks(dto.durationWeeks()));
        return saved;
    }

    public List<Plan> getPlansByUser(Long userId) {
        return progressRepository.findPlansByUserId(userId);
    }

    public Optional<Plan> getPlanById(Long id) {
        return planRepository.findById(id);
    }

    public Plan updatePlan(Long id, PlanDTO dto) {
        return planRepository.findById(id)
                .map(plan -> {
                    plan.setTitle(dto.title());
                    plan.setDescription(dto.description());
                    plan.setDifficulty(dto.difficulty());
                    plan.setSubject(
                            subjectRepository.findById(dto.subjectId())
                                    .orElseThrow(() -> new SubjectNotFoundException(dto.subjectId())));
                    return planRepository.save(plan);
                })
                .orElseThrow(() -> new PlanNotFoundException(id));
    }

    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }

    public List<Plan> searchPlans(String title, Long subjectId) {
        if (title != null && subjectId != null) {
            return planRepository.findByTitleContainingIgnoreCaseAndSubjectId(title, subjectId);
        } else if (title != null) {
            return planRepository.findByTitleContainingIgnoreCase(title);
        } else if (subjectId != null) {
            return planRepository.findBySubjectId(subjectId);
        } else {
            return planRepository.findAll();
        }
    }

    private Plan buildPlan(String title, String description, String difficulty, Subject subject) {
        return Plan.builder()
                .title(title)
                .description(description)
                .difficulty(difficulty)
                .subject(subject)
                .build();
    }

    private Week buildWeekFromDto(Plan plan, WeekDTO weekDto) {
        Week week = buildWeekShell(plan, weekDto.weekNumber(), weekDto.title(), weekDto.estimatedHours());
        List<Task> tasks = weekDto.tasks() != null
                ? weekDto.tasks().stream()
                        .map(t -> Task.builder()
                                .title(t.title())
                                .description(t.description())
                                .week(week)
                                .build())
                        .toList()
                : List.of();
        week.setTasks(tasks);
        return week;
    }

    private Week buildWeekFromGenerated(Plan plan, WeekPlanDTO weekDto) {
        Week week = buildWeekShell(plan, weekDto.weekNumber(), weekDto.title(), weekDto.estimatedHours());
        List<Task> tasks = weekDto.tasks() != null
                ? weekDto.tasks().stream()
                        .map(title -> Task.builder()
                                .title(title)
                                .description("Неделя %d: %s".formatted(weekDto.weekNumber(), weekDto.title()))
                                .week(week)
                                .build())
                        .toList()
                : List.of();
        week.setTasks(tasks);
        return week;
    }

    private Week buildWeekShell(Plan plan, int weekNumber, String title, int estimatedHours) {
        return Week.builder()
                .weekNumber(weekNumber)
                .title(title)
                .estimatedHours(estimatedHours)
                .plan(plan)
                .build();
    }

    private void linkUserToPlan(User user, Plan plan, LocalDate startDate, LocalDate endDate) {
        UserPlanProgress progress = UserPlanProgress.builder()
                .user(user)
                .studyPlan(plan)
                .startDate(startDate)
                .endDate(endDate)
                .progress(0.0)
                .build();
        progressRepository.save(progress);
    }
}
