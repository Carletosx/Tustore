package TUSTORE.demo.security.services;

import TUSTORE.demo.model.Usuario;
import TUSTORE.demo.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Implementación de UserDetailsService para la autenticación personalizada.
 * Esta clase maneja la carga de usuarios desde la base de datos y su conversión
 * a objetos UserDetails para Spring Security.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Carga un usuario por su nombre de usuario.
     *
     * @param username el nombre de usuario a buscar
     * @return UserDetails objeto con los detalles del usuario
     * @throws UsernameNotFoundException si el usuario no existe
     * @throws IllegalArgumentException si el username es null o vacío
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (!StringUtils.hasText(username)) {
            logger.error("Error al cargar usuario: username es null o vacío");
            throw new IllegalArgumentException("El nombre de usuario no puede estar vacío");
        }

        try {
            logger.debug("Intentando cargar usuario con username: {}", username);
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        logger.error("Usuario no encontrado con username: {}", username);
                        return new UsernameNotFoundException("Usuario no encontrado con username: " + username);
                    });

            logger.debug("Usuario encontrado exitosamente: {}", username);
            return UserDetailsImpl.build(usuario);
        } catch (Exception e) {
            logger.error("Error inesperado al cargar usuario: {}", username, e);
            throw new UsernameNotFoundException("Error al cargar el usuario: " + username, e);
        }
    }
}