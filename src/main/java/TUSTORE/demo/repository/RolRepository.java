package TUSTORE.demo.repository;

import TUSTORE.demo.model.ERol;
import TUSTORE.demo.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombre(ERol nombre);
}