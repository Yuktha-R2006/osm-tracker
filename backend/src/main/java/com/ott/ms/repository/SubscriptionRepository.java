package com.ott.ms.repository;

import com.ott.ms.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    List<Subscription> findByUserId(String userId);
    List<Subscription> findByPlatformId(String platformId);
    List<Subscription> findByStatus(String status);
    
    // Find active subscriptions
    List<Subscription> findByUserIdAndStatus(String userId, String status);
    
    long countByUserIdAndStatusAndIsPremium(String userId, String status, Boolean isPremium);
    long countByPlatformIdAndStatus(String platformId, String status);
    long countByPlatformIdAndStatusAndIsPremium(String platformId, String status, Boolean isPremium);
}
