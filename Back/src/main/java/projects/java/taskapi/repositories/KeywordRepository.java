package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Keyword;

import java.util.Optional;

public interface KeywordRepository extends JpaRepository<Keyword, Long> {
    Optional<Keyword> findByWordIgnoreCase(String word);
}
