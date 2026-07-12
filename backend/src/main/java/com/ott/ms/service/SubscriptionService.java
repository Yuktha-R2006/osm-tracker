package com.ott.ms.service;

import com.ott.ms.dto.SubscriptionRequest;
import com.ott.ms.model.Notification;
import com.ott.ms.model.Platform;
import com.ott.ms.model.Subscription;
import com.ott.ms.repository.NotificationRepository;
import com.ott.ms.repository.PlatformRepository;
import com.ott.ms.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PlatformRepository platformRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public boolean isPlanPremium(String platformName, String planName) {
        if (planName == null) return false;
        String pName = planName.toLowerCase();
        if (pName.contains("premium") || pName.contains("plus") || pName.contains("mega") || pName.contains("super")) {
            return true;
        }
        if ("Amazon Prime Video".equalsIgnoreCase(platformName) ||
            "Amazon Prime".equalsIgnoreCase(platformName) ||
            "Sony LIV".equalsIgnoreCase(platformName) ||
            "Zee5".equalsIgnoreCase(platformName)) {
            return true;
        }
        return false;
    }

    private void populatePlatform(Subscription s) {
        String pId = s.getPlatformId() != null ? s.getPlatformId() : s.getOttPlatformIdRaw();
        if (pId != null) {
            Platform p = platformRepository.findById(pId).orElse(null);
            s.setPopulatedPlatform(p);
        }
    }

    public List<Subscription> getSubscriptions(String userId) {
        List<Subscription> list = subscriptionRepository.findByUserId(userId);
        list.forEach(this::populatePlatform);
        return list;
    }

    public Optional<Subscription> createSubscription(String userId, SubscriptionRequest req) {
        String platformId = req.getOttPlatformId() != null ? req.getOttPlatformId() : req.getPlatformId();
        if (platformId == null) {
            return Optional.empty();
        }

        Platform platform = platformRepository.findById(platformId).orElse(null);
        if (platform == null) {
            return Optional.empty();
        }

        // Find existing subscription for this platform
        List<Subscription> userSubs = subscriptionRepository.findByUserId(userId);
        Subscription subscription = userSubs.stream()
                .filter(s -> platformId.equals(s.getPlatformId()) || platformId.equals(s.getOttPlatformId()))
                .findFirst()
                .orElse(null);

        boolean isUpdate = false;
        boolean isPremiumVal = isPlanPremium(platform.getName(), req.getPlanName() != null ? req.getPlanName() : req.getSubscriptionType());

        if (subscription != null) {
            isUpdate = true;

            subscription.setPlanName(req.getPlanName() != null ? req.getPlanName() : req.getSubscriptionType());
            subscription.setSubscriptionType(req.getPlanName() != null ? req.getPlanName() : req.getSubscriptionType());
            subscription.setStartDate(req.getStartDate());
            subscription.setExpiryDate(req.getExpiryDate() != null ? req.getExpiryDate() : req.getEndDate());
            subscription.setEndDate(req.getExpiryDate() != null ? req.getExpiryDate() : req.getEndDate());
            subscription.setSubscriptionCost(req.getSubscriptionCost() != null ? req.getSubscriptionCost() : 0.0);
            
            Boolean autoR = req.getAutoRenewal() != null ? req.getAutoRenewal() : req.getAutoRenew();
            subscription.setAutoRenewal(autoR);
            subscription.setAutoRenew(autoR);
            
            subscription.setIsPremium(isPremiumVal);
            subscription.setStatus("active");
            subscription.setCancelled(false);
            subscription.setIsCancelled(false);

            subscription = subscriptionRepository.save(subscription);
        } else {
            subscription = new Subscription();
            subscription.setUserId(userId);
            subscription.setPlatformId(platformId);
            subscription.setOttPlatformId(platformId);
            subscription.setPlanName(req.getPlanName() != null ? req.getPlanName() : req.getSubscriptionType());
            subscription.setSubscriptionType(req.getPlanName() != null ? req.getPlanName() : req.getSubscriptionType());
            subscription.setStartDate(req.getStartDate());
            subscription.setExpiryDate(req.getExpiryDate() != null ? req.getExpiryDate() : req.getEndDate());
            subscription.setEndDate(req.getExpiryDate() != null ? req.getExpiryDate() : req.getEndDate());
            subscription.setSubscriptionCost(req.getSubscriptionCost() != null ? req.getSubscriptionCost() : 0.0);
            
            Boolean autoR = req.getAutoRenewal() != null ? req.getAutoRenewal() : req.getAutoRenew();
            subscription.setAutoRenewal(autoR);
            subscription.setAutoRenew(autoR);
            
            subscription.setIsPremium(isPremiumVal);
            subscription.setStatus("active");
            
            subscription = subscriptionRepository.save(subscription);
        }

        // Notification
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setMessage(isUpdate
                ? "Subscription Updated: You have successfully updated your subscription for " + platform.getName() + "."
                : "Subscription Added: You have successfully added a new subscription for " + platform.getName() + "."
        );
        notif.setType("added");
        notificationRepository.save(notif);

        populatePlatform(subscription);
        return Optional.of(subscription);
    }

    public Optional<Subscription> updateSubscription(String userId, String subscriptionId, SubscriptionRequest req) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId).orElse(null);
        if (subscription == null || !userId.equals(subscription.getUserId())) {
            return Optional.empty();
        }

        // Store old values for notification checks
        Double oldCost = subscription.getSubscriptionCost();
        String oldStatus = subscription.getStatus();
        String oldPlanName = subscription.getPlanName();
        String oldSubtype = subscription.getSubscriptionType();
        Date oldExpiry = subscription.getExpiryDate();
        Date oldEnd = subscription.getEndDate();
        Boolean oldAutoRenewal = subscription.getAutoRenewal();
        Boolean oldAutoRenew = subscription.getAutoRenew();

        // Apply fields from req
        if (req.getStatus() != null) subscription.setStatus(req.getStatus());
        if (req.getExpiryDate() != null) {
            subscription.setExpiryDate(req.getExpiryDate());
            subscription.setEndDate(req.getExpiryDate());
        } else if (req.getEndDate() != null) {
            subscription.setExpiryDate(req.getEndDate());
            subscription.setEndDate(req.getEndDate());
        }
        if (req.getPlanName() != null) {
            subscription.setPlanName(req.getPlanName());
            subscription.setSubscriptionType(req.getPlanName());
        } else if (req.getSubscriptionType() != null) {
            subscription.setPlanName(req.getSubscriptionType());
            subscription.setSubscriptionType(req.getSubscriptionType());
        }
        if (req.getSubscriptionCost() != null) subscription.setSubscriptionCost(req.getSubscriptionCost());
        
        if (req.getAutoRenewal() != null) {
            subscription.setAutoRenewal(req.getAutoRenewal());
            subscription.setAutoRenew(req.getAutoRenewal());
        } else if (req.getAutoRenew() != null) {
            subscription.setAutoRenewal(req.getAutoRenew());
            subscription.setAutoRenew(req.getAutoRenew());
        }

        // Recheck premium if plans changed
        if (req.getPlanName() != null || req.getSubscriptionType() != null) {
            String pId = subscription.getPlatformId() != null ? subscription.getPlatformId() : subscription.getOttPlatformIdRaw();
            if (pId != null) {
                Platform platform = platformRepository.findById(pId).orElse(null);
                if (platform != null) {
                    subscription.setIsPremium(isPlanPremium(platform.getName(), subscription.getPlanName()));
                }
            }
        }

        Subscription saved = subscriptionRepository.save(subscription);
        populatePlatform(saved);

        String platformName = saved.getPopulatedPlatform() != null ? saved.getPopulatedPlatform().getName() : "Platform";

        // Renewal detection
        long oldExpiryTime = oldExpiry != null ? oldExpiry.getTime() : 0L;
        long oldEndTime = oldEnd != null ? oldEnd.getTime() : 0L;
        long newExpiryTime = saved.getExpiryDate() != null ? saved.getExpiryDate().getTime() : 0L;
        long newEndTime = saved.getEndDate() != null ? saved.getEndDate().getTime() : 0L;

        boolean expiryExtended = (newExpiryTime > 0 && newExpiryTime > oldExpiryTime) ||
                                 (newEndTime > 0 && newEndTime > oldEndTime);
        boolean isRenewed = (!"active".equalsIgnoreCase(oldStatus) && "active".equalsIgnoreCase(saved.getStatus())) || expiryExtended;

        boolean notificationCreated = false;

        if (isRenewed) {
            Notification n = new Notification();
            n.setUserId(userId);
            n.setMessage("Your subscription to " + platformName + " has been renewed.");
            n.setType("renewed");
            notificationRepository.save(n);
            notificationCreated = true;
        }

        if (saved.getSubscriptionCost() > oldCost) {
            Notification n = new Notification();
            n.setUserId(userId);
            n.setMessage("Your " + platformName + " plan has been upgraded. New cost: $" + saved.getSubscriptionCost() + "/mo.");
            n.setType("upgraded");
            notificationRepository.save(n);
            notificationCreated = true;
        } else if (saved.getSubscriptionCost() < oldCost) {
            Notification n = new Notification();
            n.setUserId(userId);
            n.setMessage("Your " + platformName + " plan has been downgraded. New cost: $" + saved.getSubscriptionCost() + "/mo.");
            n.setType("downgraded");
            notificationRepository.save(n);
            notificationCreated = true;
        }

        // Fallback for general updates
        if (!notificationCreated) {
            boolean planChanged = (req.getPlanName() != null && !req.getPlanName().equals(oldPlanName)) ||
                                  (req.getSubscriptionType() != null && !req.getSubscriptionType().equals(oldSubtype));
            boolean autoRChanged = (req.getAutoRenewal() != null && !req.getAutoRenewal().equals(oldAutoRenewal)) ||
                                   (req.getAutoRenew() != null && !req.getAutoRenew().equals(oldAutoRenew));
            if (planChanged || autoRChanged) {
                Notification n = new Notification();
                n.setUserId(userId);
                n.setMessage("Subscription Updated: Your subscription details for " + platformName + " have been updated.");
                n.setType("added");
                notificationRepository.save(n);
            }
        }

        return Optional.of(saved);
    }

    public Optional<Subscription> deleteSubscription(String userId, String subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId).orElse(null);
        if (subscription == null || !userId.equals(subscription.getUserId())) {
            return Optional.empty();
        }

        subscription.setStatus("cancelled");
        Subscription saved = subscriptionRepository.save(subscription);
        populatePlatform(saved);

        String platformName = saved.getPopulatedPlatform() != null ? saved.getPopulatedPlatform().getName() : "Platform";

        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage("Your subscription to " + platformName + " was cancelled.");
        n.setType("expired");
        notificationRepository.save(n);

        return Optional.of(saved);
    }
}
