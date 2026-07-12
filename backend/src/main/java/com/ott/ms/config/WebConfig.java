package com.ott.ms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String userDir = System.getProperty("user.dir");
        
        // 1. Serve public uploads statically from /uploads/**
        File uploadsDir = new File(userDir, "public/uploads");
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }
        String uploadsPath = "file:" + uploadsDir.getAbsolutePath() + File.separator;
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsPath);

        // 2. Serve React frontend dist folder statically at /
        File frontendDistDir = new File(userDir, "../frontend/dist");
        String frontendPath = "file:" + frontendDistDir.getAbsolutePath() + File.separator;
        registry.addResourceHandler("/**")
                .addResourceLocations(frontendPath);
    }
}
