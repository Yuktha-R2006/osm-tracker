package com.ott.ms.service;

import com.ott.ms.model.Platform;
import com.ott.ms.repository.PlatformRepository;
import com.ott.ms.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PlatformService {

    @Autowired
    private PlatformRepository platformRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // Helper to save base64 string as a local file in public/uploads and return its static path
    public String saveBase64Image(String base64String, String platformName) {
        if (base64String == null || !base64String.startsWith("data:")) {
            return base64String;
        }

        try {
            Pattern pattern = Pattern.compile("^data:([A-Za-z-+/]+);base64,(.+)$");
            Matcher matcher = pattern.matcher(base64String);
            if (!matcher.find()) {
                return base64String;
            }

            String mimeType = matcher.group(1);
            String base64Data = matcher.group(2);

            String ext = "png";
            if (mimeType.contains("/")) {
                ext = mimeType.split("/")[1];
                if (ext.contains("+")) {
                    ext = ext.split("\\+")[0];
                }
            }

            byte[] dataBytes = Base64.getDecoder().decode(base64Data);

            String cleanPlatformName = platformName.toLowerCase().replaceAll("[^a-z0-9]", "-");
            String filename = "logo-" + cleanPlatformName + "-" + System.currentTimeMillis() + "." + ext;

            String userDir = System.getProperty("user.dir");
            File uploadDir = new File(userDir, "public/uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            File file = new File(uploadDir, filename);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(dataBytes);
            }

            return "/uploads/" + filename;
        } catch (Exception e) {
            System.err.println("Failed to save base64 image: " + e.getMessage());
            return base64String;
        }
    }

    public List<Platform> getActivePlatforms() {
        return platformRepository.findByStatus("active");
    }

    public List<Map<String, Object>> getAllPlatformsEnriched() {
        List<Platform> platforms = platformRepository.findAll();
        
        return platforms.stream().map(platform -> {
            String platformId = platform.getId();
            long totalCount = subscriptionRepository.findByPlatformId(platformId).size();
            long activeCount = subscriptionRepository.countByPlatformIdAndStatus(platformId, "active");
            long cancelledCount = subscriptionRepository.countByPlatformIdAndStatus(platformId, "cancelled");
            long premiumCount = subscriptionRepository.countByPlatformIdAndStatusAndIsPremium(platformId, "active", true);

            int cancellationPercentage = totalCount > 0
                    ? Math.round(((float) cancelledCount / totalCount) * 100)
                    : 0;

            String name = platform.getName();
            boolean isTrending = (name.contains("Netflix") || name.contains("Amazon Prime Video") || 
                    name.contains("Amazon Prime") || name.contains("Disney+ Hotstar")) && activeCount > 8;

            // Build enriched map
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", platform.getId());
            map.put("_id", platform.getId());
            map.put("name", platform.getName());
            map.put("logo", platform.getLogo());
            map.put("accentColor", platform.getAccentColor());
            map.put("themeColor", platform.getThemeColor());
            map.put("description", platform.getDescription());
            map.put("monthlyPrice", platform.getMonthlyPrice());
            map.put("subscribers", (int) activeCount);
            map.put("activeUsers", (int) activeCount);
            map.put("premiumUsers", (int) premiumCount);
            map.put("premiumSubscribers", (int) premiumCount);
            map.put("cancellationRate", platform.getCancellationRate());
            map.put("cancellationPercentage", cancellationPercentage);
            map.put("status", platform.getStatus());
            map.put("plans", platform.getPlans());
            map.put("isTrending", isTrending);
            map.put("createdAt", platform.getCreatedAt());
            map.put("updatedAt", platform.getUpdatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    public Optional<Platform> createPlatform(Platform platform) {
        if (platformRepository.findByName(platform.getName()).isPresent()) {
            return Optional.empty();
        }

        String logoPath = saveBase64Image(platform.getLogo(), platform.getName());
        platform.setLogo(logoPath);
        
        // Ensure themeColor maps to accentColor
        if (platform.getAccentColor() == null) {
            platform.setAccentColor("#ff0055");
        }

        return Optional.of(platformRepository.save(platform));
    }

    public Optional<Platform> updatePlatform(String id, Platform updateData) {
        Platform platform = platformRepository.findById(id).orElse(null);
        if (platform == null) return Optional.empty();

        if (updateData.getName() != null) platform.setName(updateData.getName());
        if (updateData.getLogo() != null) {
            platform.setLogo(saveBase64Image(updateData.getLogo(), platform.getName()));
        }
        if (updateData.getStatus() != null) platform.setStatus(updateData.getStatus());
        if (updateData.getAccentColor() != null) {
            platform.setAccentColor(updateData.getAccentColor());
        }
        if (updateData.getDescription() != null) platform.setDescription(updateData.getDescription());
        if (updateData.getPlans() != null) platform.setPlans(updateData.getPlans());

        return Optional.of(platformRepository.save(platform));
    }

    public Optional<Platform> uploadLogo(String platformId, String base64Logo) {
        Platform platform = platformRepository.findById(platformId).orElse(null);
        if (platform == null) return Optional.empty();

        String logoPath = saveBase64Image(base64Logo, platform.getName());
        platform.setLogo(logoPath);

        return Optional.of(platformRepository.save(platform));
    }

    public boolean deletePlatform(String id) {
        Platform platform = platformRepository.findById(id).orElse(null);
        if (platform == null) return false;

        platformRepository.delete(platform);
        return true;
    }
}
