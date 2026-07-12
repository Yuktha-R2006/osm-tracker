package com.ott.ms.callback;

import com.ott.ms.model.Subscription;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionBeforeConvertCallback implements BeforeConvertCallback<Subscription> {
    @Override
    public Subscription onBeforeConvert(Subscription s, String collection) {
        if (s == null) return null;

        // 1. Synchronize platformId <-> ottPlatformId
        if (s.getPlatformId() != null) {
            s.setOttPlatformId(s.getPlatformId());
        } else if (s.getOttPlatformId() != null) {
            s.setPlatformId(s.getOttPlatformId().toString());
        }

        // 2. Synchronize subscriptionType <-> planName
        if (s.getSubscriptionType() != null) {
            s.setPlanName(s.getSubscriptionType());
        } else if (s.getPlanName() != null) {
            s.setSubscriptionType(s.getPlanName());
        }

        // 3. Synchronize endDate <-> expiryDate
        if (s.getEndDate() != null) {
            s.setExpiryDate(s.getEndDate());
        } else if (s.getExpiryDate() != null) {
            s.setEndDate(s.getExpiryDate());
        }

        // 4. Synchronize autoRenew <-> autoRenewal
        if (s.getAutoRenew() != null) {
            s.setAutoRenewal(s.getAutoRenew());
        } else if (s.getAutoRenewal() != null) {
            s.setAutoRenew(s.getAutoRenewal());
        }

        // 5. Synchronize cancelled <-> isCancelled
        if (s.getCancelled() != null) {
            s.setIsCancelled(s.getCancelled());
        } else if (s.getIsCancelled() != null) {
            s.setCancelled(s.getIsCancelled());
        }

        // 6. Synchronize status based on cancellation state
        if ("cancelled".equalsIgnoreCase(s.getStatus())) {
            s.setCancelled(true);
            s.setIsCancelled(true);
        } else if ("active".equalsIgnoreCase(s.getStatus())) {
            s.setCancelled(false);
            s.setIsCancelled(false);
        } else if (Boolean.TRUE.equals(s.getCancelled()) || Boolean.TRUE.equals(s.getIsCancelled())) {
            s.setStatus("cancelled");
        }

        return s;
    }
}
