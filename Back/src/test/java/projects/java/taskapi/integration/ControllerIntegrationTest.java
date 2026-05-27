package projects.java.taskapi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import projects.java.taskapi.models.*;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.models.enums.TaskStatus;
import projects.java.taskapi.repositories.*;
import projects.java.taskapi.services.FileService;
import projects.java.taskapi.services.JwtService;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full-stack integration tests. Each test runs inside a transaction that is
 * rolled back at the end, so the H2 database is always clean between tests.
 *
 * Note on HTTP status codes:
 *   - POST /api/plans returns 200 (not 201) – the controller returns Plan directly.
 *   - POST /api/notes/upload returns 200 (not 202) – uses ResponseEntity.ok().
 *   - No JWT → 401 Unauthorized (not 403) – handled by CustomAuthenticationEntryPoint.
 *   - DELETE /api/plans/{id} is role-based (MODERATOR/ADMIN), not ownership-based.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

    // repositories used for test-data setup
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private PlanRepository planRepository;
    @Autowired private ProgressRepository progressRepository;
    @Autowired private WeekRepository weekRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private NoteRepository noteRepository;
    @Autowired private KeywordRepository keywordRepository;

    // prevent the custom FlywayConfig from running migrations against H2
    // (Hibernate create-drop handles the schema instead)
    @MockBean private Flyway flyway;
    // mock AWS beans so no real S3 connection is attempted
    @MockBean private S3Client s3Client;
    @MockBean private S3Presigner s3Presigner;
    // mock FileService to avoid S3 calls from NoteService
    @MockBean private FileService fileService;

    private User studentUser;
    private User moderatorUser;
    private String studentToken;
    private String modToken;
    private Subject testSubject;
    private Plan testPlan;
    private Task testTask;
    private Note testNote;

    @BeforeEach
    void setup() {
        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleName.ROLE_STUDENT).build()));
        Role modRole = roleRepository.findByName(RoleName.ROLE_MODERATOR)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleName.ROLE_MODERATOR).build()));

        studentUser = userRepository.save(User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password"))
                .roles(Set.of(studentRole))
                .build());

        moderatorUser = userRepository.save(User.builder()
                .email("mod@test.com")
                .password(passwordEncoder.encode("password"))
                .roles(Set.of(modRole))
                .build());

        testSubject = subjectRepository.save(
                Subject.builder().name("Integration Test Subject").build());

        testPlan = planRepository.save(Plan.builder()
                .title("Test Plan")
                .subject(testSubject)
                .description("Plan description")
                .difficulty("easy")
                .build());

        progressRepository.save(UserPlanProgress.builder()
                .user(studentUser)
                .studyPlan(testPlan)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(4))
                .progress(0.0)
                .build());

        Week testWeek = weekRepository.save(Week.builder()
                .weekNumber(1)
                .title("Week One")
                .estimatedHours(10)
                .plan(testPlan)
                .build());

        testTask = taskRepository.save(Task.builder()
                .title("Integration Task")
                .description("Task for integration tests")
                .week(testWeek)
                .build());

        Keyword mathKeyword = keywordRepository.save(
                Keyword.builder().word("math").build());
        testNote = noteRepository.save(Note.builder()
                .title("Math Notes")
                .subject(testSubject)
                .user(studentUser)
                .format(NoteFormat.PDF)
                .fileUrl("test-note.pdf")
                .keywords(List.of(mathKeyword))
                .build());

        studentToken = jwtService.generateAccessToken(studentUser);
        modToken = jwtService.generateAccessToken(moderatorUser);
    }

    // ── GET /api/plans/my ────────────────────────────────────────────────────

    @Test
    void getMyPlans_withValidJwt_returns200WithPlanList() throws Exception {
        mockMvc.perform(get("/api/plans/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", isA(List.class)));
    }

    @Test
    void getMyPlans_withoutJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/plans/my"))
                .andExpect(status().isUnauthorized());
    }

    // ── POST /api/plans ──────────────────────────────────────────────────────

    @Test
    void createPlan_withValidBody_returns200() throws Exception {
        String body = """
                {
                    "title": "New Plan",
                    "subjectId": %d,
                    "description": "desc",
                    "difficulty": "medium",
                    "startDate": "2026-01-01",
                    "endDate": "2026-06-30"
                }
                """.formatted(testSubject.getId());

        mockMvc.perform(post("/api/plans")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Plan"));
    }

    @Test
    void createPlan_withMissingSubjectId_returns400() throws Exception {
        // subjectId is absent → findById(null) throws IllegalArgumentException → 400
        String body = """
                {
                    "title": "Incomplete Plan"
                }
                """;

        mockMvc.perform(post("/api/plans")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ── POST /api/notes/upload ───────────────────────────────────────────────

    @Test
    void uploadNote_withValidPdf_returns200() throws Exception {
        when(fileService.saveFile(any())).thenReturn("notes/test-upload.pdf");

        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture.pdf", "application/pdf", "PDF content".getBytes());

        mockMvc.perform(multipart("/api/notes/upload")
                        .file(file)
                        .param("title", "Lecture Notes")
                        .param("subjectId", testSubject.getId().toString())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Lecture Notes"));
    }

    @Test
    void uploadNote_withUnsupportedFileType_returns400() throws Exception {
        // text/html is not in NoteFormat → fromMultipartFile throws IllegalArgumentException → 400
        MockMultipartFile file = new MockMultipartFile(
                "file", "page.html", "text/html", "<html/>".getBytes());

        mockMvc.perform(multipart("/api/notes/upload")
                        .file(file)
                        .param("title", "Bad File")
                        .param("subjectId", testSubject.getId().toString())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/notes/byKeywords ────────────────────────────────────────────

    @Test
    void searchNotesByKeyword_whenFound_returns200WithResults() throws Exception {
        mockMvc.perform(get("/api/notes/byKeywords")
                        .param("keywords", "math")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].title").value("Math Notes"));
    }

    @Test
    void searchNotesByKeyword_whenNotFound_returns200WithEmptyArray() throws Exception {
        mockMvc.perform(get("/api/notes/byKeywords")
                        .param("keywords", "quantumphysicsxyz")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ── PUT /api/tasks/{id} ──────────────────────────────────────────────────

    @Test
    void updateTask_withValidData_returns200() throws Exception {
        String body = """
                {
                    "title": "Updated Task",
                    "description": "Updated description",
                    "deadline": "2026-12-31"
                }
                """;

        mockMvc.perform(put("/api/tasks/{id}", testTask.getId())
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Task"));
    }

    @Test
    void updateTask_withNonExistingId_returns404() throws Exception {
        String body = """
                {
                    "title": "Ghost Task",
                    "description": "Doesn't exist"
                }
                """;

        mockMvc.perform(put("/api/tasks/{id}", 999999L)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // ── DELETE /api/plans/{id} ───────────────────────────────────────────────

    @Test
    void deletePlan_asModerator_returns204() throws Exception {
        // MODERATOR has the required role → deletion succeeds
        mockMvc.perform(delete("/api/plans/{id}", testPlan.getId())
                        .header("Authorization", "Bearer " + modToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void deletePlan_asStudent_returns403() throws Exception {
        // STUDENT lacks ROLE_MODERATOR / ROLE_ADMIN → Spring Security returns 403
        mockMvc.perform(delete("/api/plans/{id}", testPlan.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}