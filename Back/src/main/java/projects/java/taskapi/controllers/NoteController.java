package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.enums.Subject;
import projects.java.taskapi.services.NoteService;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class NoteController {

    private final NoteService noteService;

    @Operation(summary = "Upload a new note file")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Note> uploadNote(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("subject") Subject subject,
            @RequestParam("format") NoteFormat format,
            @RequestParam("file") MultipartFile file) {

        Note savedNote = noteService.createNote(userId, title, subject, format, file);
        return ResponseEntity.ok(savedNote);
    }

    @Operation(summary = "Получить все конспекты (с фильтрацией и сортировкой)")
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(
            @RequestParam(required = false) Subject subject,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(noteService.getFilteredAndSortedNotes(subject, sortOrder));
    }

    @Operation(summary = "Получить все конспекты пользователя (с фильтрацией и сортировкой)")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getNotesByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Subject subject,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(noteService.getFilteredAndSortedNotesByUser(userId, subject, sortOrder));
    }

    @Operation(summary = "Скачать конспект по id")
    @GetMapping("/{noteId}/download")
    public ResponseEntity<Resource> downloadNoteFile(@PathVariable Long noteId) {
        Resource data = noteService.downloadNoteFile(noteId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=note_" + noteId + ".file")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @Operation(summary = "Удалить конспект по id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}

