package com.ott.ms.controller;

import com.ott.ms.dto.SubscriptionRequest;
import com.ott.ms.model.User;
import com.ott.ms.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<?> getSubscriptions(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authorized"));
        }
        return ResponseEntity.ok(subscriptionService.getSubscriptions(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createSubscription(@AuthenticationPrincipal User user, @RequestBody SubscriptionRequest req) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authorized"));
        }
        return subscriptionService.createSubscription(user.getId(), req)
                .<ResponseEntity<?>>map(res -> ResponseEntity.status(HttpStatus.CREATED).body(res))
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Invalid platform ID")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscription(@PathVariable String id, @AuthenticationPrincipal User user, @RequestBody SubscriptionRequest req) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authorized"));
        }
        return subscriptionService.updateSubscription(user.getId(), id, req)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Subscription not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@PathVariable String id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authorized"));
        }
        return subscriptionService.deleteSubscription(user.getId(), id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Subscription not found")));
    }
}
