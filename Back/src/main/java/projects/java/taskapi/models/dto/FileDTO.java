package projects.java.taskapi.models.dto;

import org.springframework.core.io.Resource;

public record FileDTO(
        Resource resource,
        String contentType,
        String fileName
) {}

