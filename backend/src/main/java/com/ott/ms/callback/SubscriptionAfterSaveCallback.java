package com.ott.ms.callback;

import com.ott.ms.model.Subscription;
import com.ott.ms.model.User;
import com.ott.ms.model.Platform;
import com.ott.ms.repository.UserRepository;
import com.ott.ms.repository.PlatformRepository;
import com.ott.ms.repository.SubscriptionRepository;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveCallback;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionAfterSaveCallback implements AfterSaveCallback<Subscription> {

    @Autowired
    @Lazy
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    @Lazy
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private PlatformRepository platformRepository;

    @Override
    public Subscription onAfterSave(Subscription entity, Document document, String collection) {
        try {
            // 1. Update User Premium Status
            String userId = entity.getUserId();
            if (userId != null) {
                long activePremiumCount = subscriptionRepository.countByUserIdAndStatusAndIsPremium(userId, "active", true);
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    user.setMembershipType(activePremiumCount > 0 ? "premium" : "standard");
                    userRepository.save(user);
                }
            }

            // 2. Update Platform Active and Premium Subscribers
            String platformId = entity.getPlatformId() != null ? entity.getPlatformId() : entity.getOttPlatformIdRaw();
            if (platformId != null) {
                long activeCount = subscriptionRepository.countByPlatformIdAndStatus(platformId, "active");
                long premiumCount = subscriptionRepository.countByPlatformIdAndStatusAndIsPremium(platformId, "active", true);
                
                Platform platform = platformRepository.findById(platformId).orElse(null);
                if (platform != null) {
                    platform.setActiveSubscribers((int) activeCount);
                    platform.setPremiumUsers((int) premiumCount);
                    platformRepository.save(platform);
                }
            }
        } catch (Exception e) {
            System.err.println("Error in SubscriptionAfterSaveCallback: " + e.getMessage());
        }
        return entity;
    }
}
