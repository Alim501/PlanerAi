package projects.java.taskapi.models.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
