package TUSTORE.demo.security;

import TUSTORE.demo.security.jwt.AuthEntryPointJwt;
import TUSTORE.demo.security.jwt.AuthTokenFilter;
import TUSTORE.demo.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("api/test/**").permitAll()
                    .requestMatchers("api/productos/**").permitAll()
                    .requestMatchers("api/categorias/**").permitAll()
                    .requestMatchers("api/categorias").permitAll()
                    // Agregar estas líneas para permitir acceso sin autenticación a los endpoints de Stripe
                    .requestMatchers("/api/stripe/**").permitAll()
                    .requestMatchers("/api/productos/crear").hasRole("ADMIN")
                    .requestMatchers("/api/productos/editar/**").hasRole("ADMIN")
                    .requestMatchers("/api/productos/eliminar/**").hasRole("ADMIN")
                    .requestMatchers("/api/categorias/crear").hasRole("ADMIN")
                    .requestMatchers("/api/stripe/create-checkout-session").permitAll()
                    .requestMatchers("/api/stripe/webhook").permitAll()
                    .requestMatchers("/api/categorias/editar/**").hasRole("ADMIN")
                    .requestMatchers("/api/categorias/eliminar/**").hasRole("ADMIN")
                    .requestMatchers("/api/caja/abrir").hasAnyRole("ADMIN", "CASHIER")
                    .requestMatchers("/api/caja/cerrar").hasAnyRole("ADMIN", "CASHIER")

                    .anyRequest().authenticated()
            );
        
        http.cors(Customizer.withDefaults());
        
        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("*"); // Allow all origins
        configuration.addAllowedMethod("*"); // Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
        configuration.addAllowedHeader("*"); // Allow all headers
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply this configuration to all paths
        return source;
    }
}