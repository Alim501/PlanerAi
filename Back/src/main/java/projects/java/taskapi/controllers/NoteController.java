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
import projects.java.taskapi.models.Keyword;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.Subject;
import projects.java.taskapi.services.NoteService;
import projects.java.taskapi.services.NoteStatisticsService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class NoteController {

    private final NoteService noteService;
    private final NoteStatisticsService noteStatisticsService;

    @Operation(summary = "Upload a new note file")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Note> uploadNote(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("format") NoteFormat format,
            @RequestParam("file") MultipartFile file) {

        Note savedNote = noteService.createNote(userId, title, subjectId, format, file);
        return ResponseEntity.ok(savedNote);
    }

    @Operation(summary = "Получить все конспекты (с фильтрацией и сортировкой)")
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(noteService.getFilteredAndSortedNotes(subjectId, sortOrder));
    }

    @Operation(summary = "Получить все конспекты пользователя (с фильтрацией и сортировкой)")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getNotesByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Subject subject,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        return ResponseEntity.ok(noteService.getFilteredAndSortedNotesByUser(userId, subject, sortOrder));
    }

    @Operation(summary = "Получить все конспекты по ключевым словам (по совпадению с любым из предоставленных слов)")
    @GetMapping("/byKeywords")
    public ResponseEntity<List<Note>> searchNotes(@RequestParam List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        // Normalize keywords (trim, lowercase, remove empty)
        List<String> normalized = keywords.stream()
                .flatMap(k -> Arrays.stream(k.split(","))) // support comma-separated format
                .map(String::trim)
                .filter(k -> !k.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .toList();

        if (normalized.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<Note> results = noteService.searchByKeywords(normalized);
        return ResponseEntity.ok(results);
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


    /// keywords and summary

    @Operation(summary = "Добавить ключевые слова к заметке")
    @PostMapping("/{noteId}/keywords")
    public ResponseEntity<Note> addKeywordsToNote(
            @PathVariable Long noteId,
            @RequestBody List<String> keywords) {

        Note updatedNote = noteService.addKeywordsToNote(noteId, keywords);
        return ResponseEntity.ok(updatedNote);
    }

    @Operation(summary = "Получить все ключевые слова")
    @GetMapping("/keywords")
    public ResponseEntity<List<Keyword>> getAllKeywords() {
        return ResponseEntity.ok(noteService.getAllKeywords());
    }


    /// statistics

    @Operation(summary = "Увеличение количества просмотров конспекта +1")
    @PostMapping("/{noteId}/view")
    public ResponseEntity<Note> recordView(@PathVariable Long noteId) {
        return ResponseEntity.ok(noteStatisticsService.incrementNoteViews(noteId));
    }

    @Operation(summary = "Оценка конспекта от 1 до 5 включительно")
    @PostMapping("/{noteId}/rate")
    public ResponseEntity<Note> rateNote(
            @PathVariable Long noteId,
            @RequestParam Long userId,
            @RequestParam Integer rating) {
        return ResponseEntity.ok(noteStatisticsService.rateNote(noteId, userId, rating));
    }

}

