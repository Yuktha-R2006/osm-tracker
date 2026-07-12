package com.ott.ms.controller;

import com.ott.ms.model.Platform;
import com.ott.ms.service.PlatformService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/platforms")
public class PlatformController {

    @Autowired
    private PlatformService platformService;

    @GetMapping
    public ResponseEntity<?> getPlatforms() {
        return ResponseEntity.ok(platformService.getActivePlatforms());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPlatforms() {
        return ResponseEntity.ok(platformService.getAllPlatformsEnriched());
    }

    @PostMapping
    public ResponseEntity<?> createPlatform(@RequestBody Platform platform) {
        return platformService.createPlatform(platform)
                .<ResponseEntity<?>>map(res -> ResponseEntity.status(HttpStatus.CREATED).body(res))
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Platform already exists")));
    }

    @PutMapping("/upload-logo")
    public ResponseEntity<?> uploadLogoNoId(@RequestBody Map<String, String> body) {
        String platformId = body.get("platformId");
        String logo = body.get("logo");
        if (platformId == null || logo == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Platform ID and logo are required"));
        }
        return platformService.uploadLogo(platformId, logo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Platform not found")));
    }

    @PutMapping("/{id}/logo")
    public ResponseEntity<?> uploadLogoWithId(@PathVariable String id, @RequestBody Map<String, String> body) {
        String logo = body.get("logo");
        if (logo == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Logo is required"));
        }
        return platformService.uploadLogo(id, logo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Platform not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlatform(@PathVariable String id, @RequestBody Platform platform) {
        return platformService.updatePlatform(id, platform)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Platform not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlatform(@PathVariable String id) {
        boolean deleted = platformService.deletePlatform(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Platform not found"));
        }
        return ResponseEntity.ok(Map.of("message", "Platform removed"));
    }
}
