package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.java.taskapi.models.Subject;
import projects.java.taskapi.models.dto.SubjectDTO;
import projects.java.taskapi.repositories.SubjectRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> getSubjectsList(){
        return subjectRepository.findAll();
    }

    public Subject createSubject(SubjectDTO dto){
        Subject subject = Subject.builder()
                .name(dto.name())
                .build();
        return subjectRepository.save(subject);
    }

}
