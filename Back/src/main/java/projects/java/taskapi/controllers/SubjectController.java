package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.dto.SubjectDTO;
import projects.java.taskapi.services.SubjectService;

@RestController
@RequestMapping("api/subjects")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
@Tag(name = "subject-controller", description = "accessible for ADMIN or MODERATOR")
public class SubjectController {

    private final SubjectService subjectService;

    @Operation(summary = "add a new subject")
    @PostMapping("/subject")
    public ResponseEntity<?> addSubject(@RequestBody SubjectDTO dto){
        return ResponseEntity.ok(subjectService.createSubject(dto));
    }

    @Operation(summary = "get all subjects")
    @GetMapping
    public ResponseEntity<?> getAllSubjects(){
        return ResponseEntity.ok(subjectService.getSubjectsList());
    }

    @Operation(summary = "update subject title by ID")
    @PutMapping("/{subjectId}")
    public ResponseEntity<?> updateSubject(@PathVariable("subjectId") Long subjectId,
                                           @RequestBody SubjectDTO dto){
        return ResponseEntity.ok(subjectService.updateSubject(subjectId, dto));
    }

    @Operation(summary = "delete subject by ID")
    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> deleteSubject(@PathVariable("subjectId") Long subjectId){
        subjectService.deleteSubject(subjectId);
        return ResponseEntity.noContent().build();
    }

}
