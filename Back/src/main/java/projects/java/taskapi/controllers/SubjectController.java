package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.dto.SubjectDTO;
import projects.java.taskapi.services.SubjectService;

@RestController
@RequestMapping("api/subjects")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class SubjectController {

    private final SubjectService subjectService;

    @Operation(summary = "add new subjectId")
    @PostMapping("/subject")
    public ResponseEntity<?> addSubject(@RequestBody SubjectDTO dto){
        return ResponseEntity.ok(subjectService.createSubject(dto));
    }

    @Operation(summary = "get all subjects")
    @GetMapping
    public ResponseEntity<?> getAllSubjects(){
        return ResponseEntity.ok(subjectService.getSubjectsList());
    }

}
