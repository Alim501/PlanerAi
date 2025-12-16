package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projects.java.taskapi.exceptions.NoteNotFoundException;
import projects.java.taskapi.exceptions.SubjectNotFoundException;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.Keyword;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.dto.FileDTO;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.Subject;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.repositories.KeywordRepository;
import projects.java.taskapi.repositories.NoteRepository;
import projects.java.taskapi.repositories.SubjectRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final SubjectRepository subjectRepository;
    private final KeywordRepository keywordRepository;


    public Note createNote(Long userId, String title, Long subjectId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new SubjectNotFoundException(subjectId));

        NoteFormat format = NoteFormat.fromMultipartFile(file);

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

    public List<Note> getFilteredAndSortedNotes(Long subjectId, String sortOrder) {
        List<Note> notes = (subjectId != null)
                ? noteRepository.findBySubjectId(subjectId)
                : noteRepository.findAll();

        Comparator<Note> comparator = Comparator.comparing(Note::getCreatedAt);
        if (sortOrder.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        return notes.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public List<Note> getFilteredAndSortedNotesByUser(Long userId, Long subjectId, String sortOrder) {
        List<Note> notes = (subjectId != null)
                ? noteRepository.findByUserIdAndSubjectId(userId, subjectId)
                : noteRepository.findByUserId(userId);

        Comparator<Note> comparator = Comparator.comparing(Note::getCreatedAt);
        if (sortOrder.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        return notes.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    public List<Note> searchByKeywords(List<String> keywords) {
        return noteRepository.findByKeywordsIn(keywords);
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public void deleteNote(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Students can only delete their own notes
        boolean isOwner = note.getUser().getId().equals(userId);
        boolean isModerator = user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleName.ROLE_MODERATOR
                        || role.getName() == RoleName.ROLE_ADMIN);

        if (!isOwner && !isModerator) {
            throw new AccessDeniedException("You cannot delete this note");
        }

        fileService.deleteFile(note.getFileUrl());

        noteRepository.delete(note);
    }

    public FileDTO downloadNoteFile(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));

        Resource resource = fileService.loadFile(note.getFileUrl());

        String fileName = "note_" + note.getId() + note.getFormat().getExtension();
        String contentType = note.getFormat().getMimeType();

        return new FileDTO(resource, contentType, fileName);
    }




    ///keywords and summary

    public Note addKeywordsToNote(Long noteId, List<String> newKeywords) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));

        Set<Keyword> updatedKeywords = new HashSet<>(note.getKeywords());

        for (String word : newKeywords) {
            if (word == null || word.isBlank()) continue;

            String normalized = word.trim().toLowerCase();

            Keyword keyword = keywordRepository.findByWordIgnoreCase(normalized)
                    .orElseGet(() -> keywordRepository.save(Keyword.builder().word(normalized).build()));

            updatedKeywords.add(keyword);
        }

        note.setKeywords(new ArrayList<>(updatedKeywords));
        return noteRepository.save(note);
    }

    public List<Keyword> getAllKeywords() {
        return keywordRepository.findAll();
    }

}

