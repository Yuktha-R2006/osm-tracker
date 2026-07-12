package com.ott.ms.cron;

import com.ott.ms.model.Notification;
import com.ott.ms.model.Subscription;
import com.ott.ms.model.Platform;
import com.ott.ms.repository.NotificationRepository;
import com.ott.ms.repository.SubscriptionRepository;
import com.ott.ms.repository.PlatformRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Component
public class BillingCronJob {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PlatformRepository platformRepository;

    @Scheduled(cron = "0 0 0 * * *") // Runs every day at midnight
    public void checkExpiries() {
        try {
            Date today = new Date();
            Calendar cal = Calendar.getInstance();
            cal.setTime(today);
            cal.add(Calendar.DATE, 3);
            Date soon = cal.getTime();

            List<Subscription> activeSubs = subscriptionRepository.findByStatus("active");
            int expiringSoonCount = 0;
            int expiredCount = 0;

            for (Subscription sub : activeSubs) {
                Date expiry = sub.getExpiryDate() != null ? sub.getExpiryDate() : sub.getEndDate();
                if (expiry != null) {
                    // Check expiring soon (next 3 days)
                    if (expiry.before(soon) && expiry.after(today)) {
                        String platformId = sub.getPlatformId() != null ? sub.getPlatformId() : sub.getOttPlatformIdRaw();
                        Platform platform = platformId != null ? platformRepository.findById(platformId).orElse(null) : null;
                        String platformName = platform != null ? platform.getName() : "Platform";

                        Notification n = new Notification();
                        n.setUserId(sub.getUserId());
                        n.setMessage(String.format("Your %s subscription (%s) is expiring soon on %s", 
                                platformName, sub.getPlanName(), new java.text.SimpleDateFormat("yyyy-MM-dd").format(expiry)));
                        n.setType("expiry");
                        notificationRepository.save(n);
                        expiringSoonCount++;
                    }

                    // Check expired
                    if (expiry.compareTo(today) <= 0) {
                        sub.setStatus("expired");
                        subscriptionRepository.save(sub); // triggers post-save callback!

                        String platformId = sub.getPlatformId() != null ? sub.getPlatformId() : sub.getOttPlatformIdRaw();
                        Platform platform = platformId != null ? platformRepository.findById(platformId).orElse(null) : null;
                        String platformName = platform != null ? platform.getName() : "Platform";

                        Notification n = new Notification();
                        n.setUserId(sub.getUserId());
                        n.setMessage(String.format("Your %s subscription has expired.", platformName));
                        n.setType("expired");
                        notificationRepository.save(n);
                        expiredCount++;
                    }
                }
            }
            System.out.println("CronJob: Checked expiries. Found " + expiringSoonCount + " expiring soon, " + expiredCount + " expired.");
        } catch (Exception e) {
            System.err.println("Error running cron job: " + e.getMessage());
        }
    }
}
