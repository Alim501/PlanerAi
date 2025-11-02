package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.Role;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.repositories.RoleRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;


    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    // for current user
    public User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public User updateProfile(Long userId, String firstName, String lastName) {
        User user = getUserById(userId);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return userRepository.save(user);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Старый пароль неверен");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    /// Roles management

    public User addRoleToUser(Long userId, RoleName roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleName));

        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public User removeRoleFromUser(Long userId, RoleName roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.getRoles().removeIf(role -> role.getName() == roleName);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

