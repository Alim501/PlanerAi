package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Role;
import projects.java.taskapi.models.enums.RoleName;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}