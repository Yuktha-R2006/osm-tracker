package com.ott.ms.controller;

import com.ott.ms.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Both endpoints return the same users list to match Express server.js config
    @GetMapping({"/api/admin/users", "/api/users"})
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @GetMapping("/api/admin/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/api/admin/users/{id}")
    public ResponseEntity<?> getUserDetails(@PathVariable String id) {
        return adminService.getUserDetails(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found")));
    }

    @PutMapping("/api/admin/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> req) {
        boolean updated = adminService.updateUser(id, req);
        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(Map.of("message", "User updated successfully"));
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        boolean deleted = adminService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(Map.of("message", "User removed"));
    }

    @PatchMapping("/api/admin/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        boolean toggled = adminService.toggleUserStatus(id);
        if (!toggled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    @PostMapping("/api/admin/run-cron")
    public ResponseEntity<?> runCron() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Billing cron executed successfully",
                "logs", adminService.runBillingCron()
        ));
    }
}
