package projects.java.taskapi.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.Subject;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.repositories.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock private NoteRepository noteRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileService fileService;
    @Mock private SubjectRepository subjectRepository;
    @Mock private KeywordRepository keywordRepository;

    @InjectMocks private NoteService noteService;

    // ── searchByKeywords: match found ────────────────────────────────────────

    @Test
    void searchByKeywords_whenKeywordMatches_returnsMatchingNotes() {
        // Arrange
        List<String> keywords = List.of("calculus", "algebra");
        Note note1 = Note.builder().id(1L).title("Calculus Notes").build();
        Note note2 = Note.builder().id(2L).title("Algebra Basics").build();

        when(noteRepository.findByKeywordsIn(keywords)).thenReturn(List.of(note1, note2));

        // Act
        List<Note> result = noteService.searchByKeywords(keywords);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(note1, note2);
        verify(noteRepository).findByKeywordsIn(keywords);
    }

    // ── searchByKeywords: no match ───────────────────────────────────────────

    @Test
    void searchByKeywords_whenNoKeywordMatches_returnsEmptyList() {
        // Arrange
        List<String> keywords = List.of("nonexistenttopic");

        when(noteRepository.findByKeywordsIn(keywords)).thenReturn(List.of());

        // Act
        List<Note> result = noteService.searchByKeywords(keywords);

        // Assert
        assertThat(result).isEmpty();
        verify(noteRepository).findByKeywordsIn(keywords);
    }

    // ── createNote: valid data ───────────────────────────────────────────────

    @Test
    void createNote_withValidData_savesAndReturnsNote() {
        // Arrange
        Long userId = 1L;
        Long subjectId = 2L;
        String title = "My PDF Note";

        User user = User.builder().id(userId).email("user@test.com").build();
        Subject subject = Subject.builder().id(subjectId).name("Math").build();

        MultipartFile file = mock(MultipartFile.class);
        // application/pdf maps to NoteFormat.PDF inside NoteFormat.fromMultipartFile
        when(file.getContentType()).thenReturn("application/pdf");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(subjectRepository.findById(subjectId)).thenReturn(Optional.of(subject));
        when(fileService.saveFile(file)).thenReturn("notes/abc123.pdf");

        Note savedNote = Note.builder()
                .id(10L).title(title).user(user).subject(subject)
                .format(NoteFormat.PDF).fileUrl("notes/abc123.pdf")
                .build();
        when(noteRepository.save(any(Note.class))).thenReturn(savedNote);

        // Act
        Note result = noteService.createNote(userId, title, subjectId, file);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo(title);
        assertThat(result.getFileUrl()).isEqualTo("notes/abc123.pdf");
        verify(fileService).saveFile(file);
        verify(noteRepository).save(any(Note.class));
    }
}