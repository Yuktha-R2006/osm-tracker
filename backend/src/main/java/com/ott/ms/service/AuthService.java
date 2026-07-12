package com.ott.ms.service;

import com.ott.ms.dto.*;
import com.ott.ms.model.User;
import com.ott.ms.repository.UserRepository;
import com.ott.ms.repository.SubscriptionRepository;
import com.ott.ms.repository.NotificationRepository;
import com.ott.ms.security.JwtUtils;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public Optional<LoginResponse> register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
            return Optional.empty();
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");

        User savedUser = userRepository.save(user);
        
        String accessToken = jwtUtils.generateAccessToken(savedUser.getId(), savedUser.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(savedUser.getId(), savedUser.getRole());

        return Optional.of(new LoginResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                accessToken,
                refreshToken
        ));
    }

    public Optional<LoginResponse> login(LoginRequest request) {
        String email = request.getEmail().toLowerCase();
        
        // Admin login logic
        if ("admin".equalsIgnoreCase(request.getRole())) {
            if (!"admin@osm.com".equals(email) || !"admin123".equals(request.getPassword())) {
                return Optional.empty();
            }
            
            User adminUser = userRepository.findByEmail("admin@osm.com").orElseGet(() -> {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@osm.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("admin");
                return userRepository.save(admin);
            });

            String accessToken = jwtUtils.generateAccessToken(adminUser.getId(), adminUser.getRole());
            String refreshToken = jwtUtils.generateRefreshToken(adminUser.getId(), adminUser.getRole());

            return Optional.of(new LoginResponse(
                    adminUser.getId(),
                    adminUser.getName(),
                    adminUser.getEmail(),
                    adminUser.getRole(),
                    accessToken,
                    refreshToken
            ));
        }

        // Regular user login
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            if (!"user".equalsIgnoreCase(user.getRole())) {
                return Optional.empty();
            }

            String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getRole());
            String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getRole());

            return Optional.of(new LoginResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    accessToken,
                    refreshToken
            ));
        }

        return Optional.empty();
    }

    public Optional<TokenRefreshResponse> refresh(String token) {
        if (!jwtUtils.validateRefreshToken(token)) {
            return Optional.empty();
        }

        try {
            Claims claims = jwtUtils.getRefreshClaims(token);
            String id = claims.get("id", String.class);
            String role = claims.get("role", String.class);

            String newAccess = jwtUtils.generateAccessToken(id, role);
            String newRefresh = jwtUtils.generateRefreshToken(id, role);

            return Optional.of(new TokenRefreshResponse(newAccess, newRefresh));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public User updateProfile(String userId, User updateData) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        if (updateData.getName() != null) user.setName(updateData.getName());
        if (updateData.getEmail() != null) user.setEmail(updateData.getEmail().toLowerCase());
        if (updateData.getAvatar() != null) user.setAvatar(updateData.getAvatar());
        if (updateData.getPreferredPlatform() != null) user.setPreferredPlatform(updateData.getPreferredPlatform());
        
        if (updateData.getPassword() != null && !updateData.getPassword().trim().isEmpty() && !updateData.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }

        return userRepository.save(user);
    }

    public User updateSettings(String userId, Map<String, Object> settings) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        if (settings.containsKey("darkMode")) user.setDarkMode((Boolean) settings.get("darkMode"));
        if (settings.containsKey("emailNotifications")) user.setEmailNotifications((Boolean) settings.get("emailNotifications"));
        if (settings.containsKey("autoRenewalAlerts")) user.setAutoRenewalAlerts((Boolean) settings.get("autoRenewalAlerts"));
        if (settings.containsKey("isPremium")) {
            user.setIsPremium((Boolean) settings.get("isPremium"));
        }

        return userRepository.save(user);
    }

    public boolean deleteAccount(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        // Clean up subscriptions
        subscriptionRepository.deleteAll(subscriptionRepository.findByUserId(userId));

        // Clean up notifications
        notificationRepository.deleteAll(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));

        userRepository.delete(user);
        return true;
    }
}
