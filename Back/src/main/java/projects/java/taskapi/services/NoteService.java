package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.enums.Subject;
import projects.java.taskapi.repositories.NoteRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final FileService fileService;


    public Note createNote(Long userId, String title, Subject subject, NoteFormat format, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save file to "uploads/notes/"
        String fileUrl = fileService.saveFile(file);

        Note note = Note.builder()
                .title(title)
                .format(format)
                .subject(subject)
                .fileUrl(fileUrl)
                .user(user)
                .build();

        return noteRepository.save(note);
    }

    public List<Note> getFilteredAndSortedNotes(Subject subject, String sortOrder) {
        List<Note> notes = (subject != null)
                ? noteRepository.findBySubject(subject)
                : noteRepository.findAll();

        Comparator<Note> comparator = Comparator.comparing(Note::getCreatedAt);
        if (sortOrder.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        return notes.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public List<Note> getFilteredAndSortedNotesByUser(Long userId, Subject subject, String sortOrder) {
        List<Note> notes = (subject != null)
                ? noteRepository.findByUserIdAndSubject(userId, subject)
                : noteRepository.findByUserId(userId);

        Comparator<Note> comparator = Comparator.comparing(Note::getCreatedAt);
        if (sortOrder.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        return notes.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    public Resource downloadNoteFile(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        return fileService.loadFile(note.getFileUrl());
    }
}

