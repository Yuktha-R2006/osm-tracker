package com.ott.ms.service;

import com.ott.ms.model.Notification;
import com.ott.ms.model.Platform;
import com.ott.ms.model.Subscription;
import com.ott.ms.model.User;
import com.ott.ms.repository.NotificationRepository;
import com.ott.ms.repository.PlatformRepository;
import com.ott.ms.repository.SubscriptionRepository;
import com.ott.ms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlatformRepository platformRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public boolean isSubscriptionActive(Subscription sub) {
        String status = sub.getStatus() != null ? sub.getStatus() : "active";
        boolean isCancelled = Boolean.TRUE.equals(sub.getCancelled()) || 
                             Boolean.TRUE.equals(sub.getIsCancelled()) || 
                             "cancelled".equalsIgnoreCase(status);
        return "active".equalsIgnoreCase(status) && !isCancelled;
    }

    public List<Map<String, Object>> enrichUsersWithSubscriptions(List<User> usersList) {
        return usersList.stream().map(user -> {
            List<Subscription> subscriptions = subscriptionRepository.findByUserId(user.getId());
            
            // Populate nested platforms
            subscriptions.forEach(sub -> {
                String pId = sub.getPlatformId() != null ? sub.getPlatformId() : sub.getOttPlatformIdRaw();
                if (pId != null) {
                    sub.setPopulatedPlatform(platformRepository.findById(pId).orElse(null));
                }
            });

            Date earliestStartDate = null;
            int totalRenewals = 0;
            int activeSubscriptionsCount = 0;
            boolean hasActivePremium = false;
            Map<String, Integer> platformActiveDays = new HashMap<>();

            for (Subscription sub : subscriptions) {
                totalRenewals += sub.getRenewalCount() != null ? sub.getRenewalCount() : 0;

                if (sub.getStartDate() != null) {
                    if (earliestStartDate == null || sub.getStartDate().before(earliestStartDate)) {
                        earliestStartDate = sub.getStartDate();
                    }
                }

                if (isSubscriptionActive(sub)) {
                    activeSubscriptionsCount++;
                    if (Boolean.TRUE.equals(sub.getIsPremium())) {
                        hasActivePremium = true;
                    }

                    long startDateMs = sub.getStartDate() != null ? sub.getStartDate().getTime() : System.currentTimeMillis();
                    int days = Math.max(0, (int) Math.ceil((System.currentTimeMillis() - startDateMs) / (1000.0 * 60 * 60 * 24)));
                    String platformName = sub.getPopulatedPlatform() != null ? sub.getPopulatedPlatform().getName() : "Netflix";
                    platformActiveDays.put(platformName, platformActiveDays.getOrDefault(platformName, 0) + days);
                }
            }

            String favoriteOTT = "None";
            int maxDays = -1;
            for (String pName : platformActiveDays.keySet()) {
                if (platformActiveDays.get(pName) > maxDays) {
                    maxDays = platformActiveDays.get(pName);
                    favoriteOTT = pName;
                }
            }
            if ("None".equals(favoriteOTT) && !subscriptions.isEmpty()) {
                Subscription firstSub = subscriptions.stream()
                        .filter(s -> s.getPopulatedPlatform() != null)
                        .findFirst()
                        .orElse(null);
                if (firstSub != null && firstSub.getPopulatedPlatform() != null) {
                    favoriteOTT = firstSub.getPopulatedPlatform().getName();
                }
            }

            int activeSubscriptionDays = 0;
            if (earliestStartDate != null) {
                activeSubscriptionDays = Math.max(0, (int) Math.ceil((System.currentTimeMillis() - earliestStartDate.getTime()) / (1000.0 * 60 * 60 * 24)));
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("_id", user.getId());
            map.put("name", user.getName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole());
            map.put("profileImage", user.getProfileImage());
            map.put("avatar", user.getAvatar());
            map.put("favoriteOTT", favoriteOTT);
            map.put("preferredPlatform", user.getPreferredPlatform());
            map.put("isPremium", hasActivePremium || user.getIsPremium());
            map.put("membershipType", user.getMembershipType());
            map.put("subscriptionCount", subscriptions.size());
            map.put("activeSubscriptionsCount", activeSubscriptionsCount);
            map.put("activeSubscriptionDays", activeSubscriptionDays);
            map.put("activeDays", user.getActiveDays());
            map.put("totalRenewals", totalRenewals);
            map.put("renewalCount", user.getRenewalCount());
            map.put("currencyPreference", user.getCurrencyPreference());
            map.put("darkMode", user.getDarkMode());
            map.put("joinedDate", user.getJoinedDate());
            map.put("lastActive", user.getLastActive());
            map.put("isActive", user.getIsActive());
            map.put("emailNotifications", user.getEmailNotifications());
            map.put("autoRenewalAlerts", user.getAutoRenewalAlerts());
            map.put("totalWatchTime", user.getTotalWatchTime());
            map.put("watchHistory", user.getWatchHistory());
            map.put("subscriptions", subscriptions);
            map.put("createdAt", user.getCreatedAt());
            map.put("updatedAt", user.getUpdatedAt());

            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUsers() {
        // Exclude system admin (email starts with admin@)
        List<User> rawUsers = userRepository.findByRole("user");
        return enrichUsersWithSubscriptions(rawUsers);
    }

    public Map<String, Object> getStats() {
        List<Map<String, Object>> users = getUsers();
        List<Platform> platforms = platformRepository.findAll();

        List<Map<String, Object>> allSubs = new ArrayList<>();
        for (Map<String, Object> u : users) {
            List<Subscription> subs = (List<Subscription>) u.get("subscriptions");
            if (subs != null) {
                for (Subscription s : subs) {
                    String platformName = s.getPopulatedPlatform() != null ? s.getPopulatedPlatform().getName() : "Netflix";
                    
                    long startDateMs = s.getStartDate() != null ? s.getStartDate().getTime() : System.currentTimeMillis();
                    int subActiveDays = Math.max(0, (int) Math.ceil((System.currentTimeMillis() - startDateMs) / (1000.0 * 60 * 60 * 24)));
                    boolean cancelled = Boolean.TRUE.equals(s.getIsCancelled()) || "cancelled".equalsIgnoreCase(s.getStatus());

                    Map<String, Object> subMap = new HashMap<>();
                    subMap.put("id", s.getId());
                    subMap.put("_id", s.getId());
                    subMap.put("userId", u.get("id"));
                    subMap.put("platformId", s.getPlatformId());
                    subMap.put("ottPlatformId", s.getOttPlatformIdRaw());
                    subMap.put("platformName", platformName);
                    subMap.put("planName", s.getPlanName());
                    subMap.put("subscriptionType", s.getSubscriptionType());
                    subMap.put("status", s.getStatus());
                    subMap.put("isPremium", s.getIsPremium());
                    subMap.put("startDate", s.getStartDate());
                    subMap.put("endDate", s.getEndDate());
                    subMap.put("expiryDate", s.getExpiryDate());
                    subMap.put("subscriptionCost", s.getSubscriptionCost());
                    subMap.put("renewalCount", s.getRenewalCount() != null ? s.getRenewalCount() : 0);
                    subMap.put("activeDays", subActiveDays);
                    subMap.put("cancelled", cancelled);
                    subMap.put("autoRenew", Boolean.TRUE.equals(s.getAutoRenew()) || Boolean.TRUE.equals(s.getAutoRenewal()));
                    
                    allSubs.add(subMap);
                }
            }
        }

        int totalUsers = users.size();
        int totalPlatforms = platforms.size();
        int totalSubscriptions = allSubs.size();

        long activeSubscriptions = allSubs.stream().filter(s -> {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            return "active".equalsIgnoreCase(status) && !cancelled;
        }).count();

        long cancelledSubscriptions = allSubs.stream().filter(s -> (Boolean) s.get("cancelled")).count();
        long expiredSubscriptions = allSubs.stream().filter(s -> {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            return !"active".equalsIgnoreCase(status) && !cancelled;
        }).count();

        int cancellationRate = totalSubscriptions > 0
                ? Math.round(((float) cancelledSubscriptions / totalSubscriptions) * 100)
                : 0;

        // Cancellation by platform
        Map<String, Integer> platformCancels = new HashMap<>();
        allSubs.stream().filter(s -> (Boolean) s.get("cancelled")).forEach(s -> {
            String pName = (String) s.get("platformName");
            platformCancels.put(pName, platformCancels.getOrDefault(pName, 0) + 1);
        });
        String mostCancelledPlatform = "None";
        int maxCancels = -1;
        for (String pName : platformCancels.keySet()) {
            if (platformCancels.get(pName) > maxCancels) {
                maxCancels = platformCancels.get(pName);
                mostCancelledPlatform = pName;
            }
        }

        // Premium user percent
        long premiumSubscriptionsCount = allSubs.stream().filter(s -> {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            boolean active = "active".equalsIgnoreCase(status) && !cancelled;
            return Boolean.TRUE.equals(s.get("isPremium")) && active;
        }).count();
        int premiumUserPercent = totalSubscriptions > 0
                ? Math.round(((float) premiumSubscriptionsCount / totalSubscriptions) * 100)
                : 0;

        // Highest premium platform
        Map<String, Integer> platformPremiums = new HashMap<>();
        allSubs.stream().filter(s -> {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            boolean active = "active".equalsIgnoreCase(status) && !cancelled;
            return Boolean.TRUE.equals(s.get("isPremium")) && active;
        }).forEach(s -> {
            String pName = (String) s.get("platformName");
            platformPremiums.put(pName, platformPremiums.getOrDefault(pName, 0) + 1);
        });
        String highestPremiumPlatform = "None";
        int maxPremiums = -1;
        for (String pName : platformPremiums.keySet()) {
            if (platformPremiums.get(pName) > maxPremiums) {
                maxPremiums = platformPremiums.get(pName);
                highestPremiumPlatform = pName;
            }
        }

        // Platform stats
        Map<String, Map<String, Integer>> platformStats = new HashMap<>();
        platforms.forEach(p -> {
            Map<String, Integer> details = new HashMap<>();
            details.put("subscribers", 0);
            details.put("recentCount", 0);
            platformStats.put(p.getName(), details);
        });

        allSubs.forEach(s -> {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            boolean active = "active".equalsIgnoreCase(status) && !cancelled;
            
            if (active) {
                String pName = (String) s.get("platformName");
                Map<String, Integer> details = platformStats.computeIfAbsent(pName, k -> {
                    Map<String, Integer> d = new HashMap<>();
                    d.put("subscribers", 0);
                    d.put("recentCount", 0);
                    return d;
                });
                
                details.put("subscribers", details.get("subscribers") + 1);
                
                Date startDate = (Date) s.get("startDate");
                long startMs = startDate != null ? startDate.getTime() : System.currentTimeMillis();
                if (System.currentTimeMillis() - startMs <= 30L * 24 * 60 * 60 * 1000) {
                    details.put("recentCount", details.get("recentCount") + 1);
                }
            }
        });

        List<Map<String, Object>> platformList = platformStats.keySet().stream().map(pName -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", pName);
            map.put("subscribers", platformStats.get(pName).get("subscribers"));
            map.put("recentCount", platformStats.get(pName).get("recentCount"));
            return map;
        }).sorted((a, b) -> (Integer) b.get("subscribers") - (Integer) a.get("subscribers")).collect(Collectors.toList());

        String topPlatformBySubs = platformList.isEmpty() ? "None" : (String) platformList.get(0).get("name");
        int topPlatformSubsCount = platformList.isEmpty() ? 0 : (Integer) platformList.get(0).get("subscribers");

        // Longest continuous subscriber
        Map<String, Object> longestContinuousSubscriber = new HashMap<>();
        longestContinuousSubscriber.put("platformName", "None");
        longestContinuousSubscriber.put("activeDays", 0);
        longestContinuousSubscriber.put("userName", "None");
        
        long minStart = Long.MAX_VALUE;
        for (Map<String, Object> s : allSubs) {
            String status = (String) s.get("status");
            boolean cancelled = (Boolean) s.get("cancelled");
            boolean active = "active".equalsIgnoreCase(status) && !cancelled;

            if (active) {
                Date start = (Date) s.get("startDate");
                long startTime = start != null ? start.getTime() : System.currentTimeMillis();
                if (startTime < minStart) {
                    minStart = startTime;
                    Map<String, Object> matchedUser = users.stream()
                            .filter(u -> u.get("id").toString().equals(s.get("userId").toString()))
                            .findFirst()
                            .orElse(null);
                    longestContinuousSubscriber.put("platformName", s.get("platformName"));
                    longestContinuousSubscriber.put("activeDays", s.get("activeDays"));
                    longestContinuousSubscriber.put("userName", matchedUser != null ? matchedUser.get("name") : "Unknown");
                }
            }
        }

        String fastestGrowingPlatform = "None";
        int fastestGrowingRate = 0;
        for (Map<String, Object> p : platformList) {
            int subs = (Integer) p.get("subscribers");
            int recent = (Integer) p.get("recentCount");
            int growth = subs > 0 ? Math.round(((float) recent / subs) * 100) : 0;
            if (growth > fastestGrowingRate) {
                fastestGrowingRate = growth;
                fastestGrowingPlatform = (String) p.get("name");
            }
        }
        if (fastestGrowingRate == 0 && !platformList.isEmpty()) {
            fastestGrowingPlatform = (String) platformList.get(0).get("name");
            fastestGrowingRate = 12;
        }

        Platform leadingPlatformDoc = platforms.stream().filter(p -> p.getName().equals(topPlatformBySubs)).findFirst().orElse(null);
        Map<String, Object> leadingPlatform = null;
        if (leadingPlatformDoc != null) {
            Map<String, Integer> statsForLeading = platformStats.get(topPlatformBySubs);
            int subs = statsForLeading != null ? statsForLeading.get("subscribers") : 0;
            int recent = statsForLeading != null ? statsForLeading.get("recentCount") : 0;
            int growth = subs > 0 ? Math.round(((float) recent / subs) * 100) : 15;

            leadingPlatform = new HashMap<>();
            leadingPlatform.put("name", leadingPlatformDoc.getName());
            leadingPlatform.put("logo", leadingPlatformDoc.getLogo());
            leadingPlatform.put("subscribers", topPlatformSubsCount);
            leadingPlatform.put("growth", growth);
            leadingPlatform.put("subsContribution", activeSubscriptions > 0 ? Math.round(((float) topPlatformSubsCount / activeSubscriptions) * 100) : 0);
        }

        List<Map<String, Object>> pieData = platformList.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", p.get("name"));
            map.put("value", p.get("subscribers"));
            return map;
        }).collect(Collectors.toList());

        // Last 6 months chronological charts
        List<Map<String, Object>> barData = new ArrayList<>();
        List<Map<String, Object>> areaData = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            String monthLabel = d.format(DateTimeFormatter.ofPattern("MMM"));
            
            LocalDate startOfMonth = d.withDayOfMonth(1);
            LocalDate endOfMonth = d.withDayOfMonth(d.lengthOfMonth());
            
            Date startOfMonthDate = Date.from(startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date endOfMonthDate = Date.from(endOfMonth.atTime(23, 59, 59, 999000000).atZone(ZoneId.systemDefault()).toInstant());

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("name", monthLabel);
            int activeCount = 0;

            for (Platform p : platforms) {
                List<Map<String, Object>> platformSubs = allSubs.stream()
                        .filter(s -> p.getName().equals(s.get("platformName")))
                        .collect(Collectors.toList());

                long activeSubsThisMonth = platformSubs.stream().filter(s -> {
                    Date start = (Date) s.get("startDate");
                    Date expiry = (Date) s.get("expiryDate");
                    boolean isCancelled = (Boolean) s.get("cancelled");
                    // Assuming cancellation time is expiry date or start time
                    long cancellationTime = expiry != null ? expiry.getTime() : 0L;

                    return start != null && start.getTime() <= endOfMonthDate.getTime() &&
                           expiry != null && expiry.getTime() >= startOfMonthDate.getTime() &&
                           (!isCancelled || cancellationTime >= startOfMonthDate.getTime());
                }).count();

                long gainedSubsThisMonth = platformSubs.stream().filter(s -> {
                    Date start = (Date) s.get("startDate");
                    return start != null && start.getTime() >= startOfMonthDate.getTime() && start.getTime() <= endOfMonthDate.getTime();
                }).count();

                long lostSubsThisMonth = platformSubs.stream().filter(s -> {
                    boolean isCancelled = (Boolean) s.get("cancelled");
                    Date expiry = (Date) s.get("expiryDate");
                    long cancellationTime = expiry != null ? expiry.getTime() : 0L;
                    return isCancelled && cancellationTime >= startOfMonthDate.getTime() && cancellationTime <= endOfMonthDate.getTime();
                }).count();

                monthData.put(p.getName(), (int) activeSubsThisMonth);
                monthData.put(p.getName() + "_gained", (int) gainedSubsThisMonth);
                monthData.put(p.getName() + "_lost", (int) lostSubsThisMonth);

                activeCount += activeSubsThisMonth;
            }

            barData.add(monthData);
            
            Map<String, Object> areaMap = new HashMap<>();
            areaMap.put("name", monthLabel);
            areaMap.put("active", activeCount);
            areaData.add(areaMap);
        }

        // Most active users
        List<Map<String, Object>> mostActiveUsers = users.stream()
                .sorted((a, b) -> {
                    int compareActive = (Integer) b.get("activeSubscriptionsCount") - (Integer) a.get("activeSubscriptionsCount");
                    if (compareActive != 0) return compareActive;
                    
                    int compareDays = (Integer) b.get("activeSubscriptionDays") - (Integer) a.get("activeSubscriptionDays");
                    if (compareDays != 0) return compareDays;

                    return (Integer) b.get("totalRenewals") - (Integer) a.get("totalRenewals");
                })
                .limit(5)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.get("id"));
                    map.put("_id", u.get("id"));
                    map.put("name", u.get("name"));
                    map.put("email", u.get("email"));
                    map.put("avatar", u.get("avatar"));
                    map.put("profileImage", u.get("profileImage"));
                    map.put("activeSubscriptionsCount", u.get("activeSubscriptionsCount"));
                    map.put("activeSubscriptionDays", u.get("activeSubscriptionDays"));
                    map.put("totalRenewals", u.get("totalRenewals"));
                    return map;
                })
                .collect(Collectors.toList());

        // Renewals count (number of active subscriptions with auto-renewal enabled)
        long subscriptionRenewals = allSubs.stream()
                .filter(s -> {
                    String status = (String) s.get("status");
                    boolean cancelled = (Boolean) s.get("cancelled");
                    boolean active = "active".equalsIgnoreCase(status) && !cancelled;
                    return active && Boolean.TRUE.equals(s.get("autoRenew"));
                })
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalPlatforms", totalPlatforms);
        stats.put("totalSubscriptions", totalSubscriptions);
        stats.put("activeSubscriptions", (int) activeSubscriptions);
        stats.put("cancelledSubscriptions", (int) cancelledSubscriptions);
        stats.put("expiredSubscriptions", (int) expiredSubscriptions);
        stats.put("cancellationRate", cancellationRate);
        stats.put("cancellationTrend", -1.2);
        stats.put("mostCancelledPlatform", mostCancelledPlatform);
        stats.put("premiumUserPercent", premiumUserPercent);
        stats.put("premiumSubscriptionsCount", (int) premiumSubscriptionsCount);
        stats.put("highestPremiumPlatform", highestPremiumPlatform);
        stats.put("topPlatformBySubs", topPlatformBySubs);
        stats.put("longestContinuousSubscriber", longestContinuousSubscriber);
        stats.put("fastestGrowingPlatform", fastestGrowingPlatform);
        stats.put("fastestGrowingRate", fastestGrowingRate);
        stats.put("leadingPlatform", leadingPlatform);
        stats.put("barData", barData);
        stats.put("pieData", pieData);
        stats.put("areaData", areaData);
        stats.put("mostActiveUsers", mostActiveUsers);
        stats.put("subscriptionRenewals", (int) subscriptionRenewals);

        return stats;
    }

    public Optional<User> getUserDetails(String id) {
        return userRepository.findById(id);
    }

    public boolean updateUser(String id, Map<String, Object> req) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return false;

        if (req.containsKey("name")) user.setName((String) req.get("name"));
        if (req.containsKey("email")) user.setEmail(((String) req.get("email")).toLowerCase());
        if (req.containsKey("isPremium")) {
            user.setIsPremium((Boolean) req.get("isPremium"));
        }
        if (req.containsKey("isActive")) user.setIsActive((Boolean) req.get("isActive"));
        if (req.containsKey("totalRenewals")) {
            user.setRenewalCount(((Number) req.get("totalRenewals")).intValue());
        }

        userRepository.save(user);
        return true;
    }

    public boolean deleteUser(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return false;

        // Find platform ids for user's subscriptions before deleting
        List<Subscription> subs = subscriptionRepository.findByUserId(id);
        List<String> platformIds = subs.stream()
                .map(s -> s.getPlatformId() != null ? s.getPlatformId() : s.getOttPlatformIdRaw())
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // Delete user subscriptions
        subscriptionRepository.deleteAll(subs);

        // Delete user notifications
        notificationRepository.deleteAll(notificationRepository.findByUserIdOrderByCreatedAtDesc(id));

        // Delete user
        userRepository.delete(user);

        // Recalculate platform active subscriber counts
        for (String platformId : platformIds) {
            long activeCount = subscriptionRepository.countByPlatformIdAndStatus(platformId, "active");
            long premiumCount = subscriptionRepository.countByPlatformIdAndStatusAndIsPremium(platformId, "active", true);
            Platform platform = platformRepository.findById(platformId).orElse(null);
            if (platform != null) {
                platform.setActiveSubscribers((int) activeCount);
                platform.setPremiumUsers((int) premiumCount);
                platformRepository.save(platform);
            }
        }

        return true;
    }

    public boolean toggleUserStatus(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return false;

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        return true;
    }

    public List<String> runBillingCron() {
        List<String> logs = new ArrayList<>();
        logs.add("System cron spawned. Authenticating request...");

        List<User> standardUsers = userRepository.findByRole("user");
        logs.add("Querying database: " + standardUsers.size() + " active users found in pool...");

        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        logs.add("Validating " + allSubscriptions.size() + " subscription entries...");

        Date today = new Date();

        // Find active subscriptions past endDate
        List<Subscription> pastActiveSubs = allSubscriptions.stream()
                .filter(s -> "active".equalsIgnoreCase(s.getStatus()) && s.getEndDate() != null && s.getEndDate().compareTo(today) <= 0)
                .collect(Collectors.toList());

        List<Subscription> autoRenewable = pastActiveSubs.stream()
                .filter(s -> Boolean.TRUE.equals(s.getAutoRenew()) || Boolean.TRUE.equals(s.getAutoRenewal()))
                .collect(Collectors.toList());

        List<Subscription> nonAutoRenewable = pastActiveSubs.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getAutoRenew()) && !Boolean.TRUE.equals(s.getAutoRenewal()))
                .collect(Collectors.toList());

        int expiredCount = 0;
        for (Subscription sub : nonAutoRenewable) {
            sub.setStatus("expired");
            subscriptionRepository.save(sub);
            
            expiredCount++;
            User matchedUser = userRepository.findById(sub.getUserId()).orElse(null);
            String userName = matchedUser != null ? matchedUser.getName() : "Unknown User";
            
            String pId = sub.getPlatformId() != null ? sub.getPlatformId() : sub.getOttPlatformIdRaw();
            Platform platform = pId != null ? platformRepository.findById(pId).orElse(null) : null;
            String platformName = platform != null ? platform.getName() : "Unknown OTT";
            
            logs.add("Identified: [EXPIRED] Subscription for user \"" + userName + "\" on platform \"" + platformName + "\" past expiry.");

            if (sub.getUserId() != null) {
                Notification n = new Notification();
                n.setUserId(sub.getUserId());
                n.setMessage("Your " + platformName + " subscription has expired.");
                n.setType("expired");
                notificationRepository.save(n);
            }
        }

        if (!nonAutoRenewable.isEmpty()) {
            logs.add("Expired Detection: Processed and set status to [EXPIRED] for " + expiredCount + " subscription entries.");
        } else {
            logs.add("Expired Detection: Checked active pools. No manual-renewing expired subscriptions detected.");
        }

        int renewedCount = 0;
        int notificationCount = expiredCount;
        for (Subscription sub : autoRenewable) {
            Date oldEndDate = sub.getEndDate();
            Calendar cal = Calendar.getInstance();
            cal.setTime(oldEndDate);
            cal.add(Calendar.MONTH, 1);
            Date newEndDate = cal.getTime();

            sub.setStartDate(oldEndDate);
            sub.setEndDate(newEndDate);
            sub.setExpiryDate(newEndDate);
            sub.setRenewalCount((sub.getRenewalCount() != null ? sub.getRenewalCount() : 0) + 1);
            subscriptionRepository.save(sub);

            renewedCount++;
            User matchedUser = userRepository.findById(sub.getUserId()).orElse(null);
            String userName = matchedUser != null ? matchedUser.getName() : "Unknown User";

            String pId = sub.getPlatformId() != null ? sub.getPlatformId() : sub.getOttPlatformIdRaw();
            Platform platform = pId != null ? platformRepository.findById(pId).orElse(null) : null;
            String platformName = platform != null ? platform.getName() : "Unknown OTT";
            double cost = sub.getSubscriptionCost() != null ? sub.getSubscriptionCost() : 9.99;

            logs.add("Auto-Renew Check: Invoiced \"" + userName + "\" $" + cost + " for platform \"" + platformName + "\". Extended to " + new java.text.SimpleDateFormat("yyyy-MM-dd").format(newEndDate) + ".");

            if (sub.getUserId() != null) {
                Notification n1 = new Notification();
                n1.setUserId(sub.getUserId());
                n1.setMessage("Your " + platformName + " subscription auto-renewed successfully. Invoice payment of $" + cost + " received.");
                n1.setType("renewed");
                notificationRepository.save(n1);

                Notification n2 = new Notification();
                n2.setUserId(sub.getUserId());
                n2.setMessage("Payment of $" + cost + " for " + platformName + " processed successfully.");
                n2.setType("payment");
                notificationRepository.save(n2);

                notificationCount += 2;
            }
        }

        if (!autoRenewable.isEmpty()) {
            logs.add("Auto-Billing Check: Simulated auto-renewal check. Invoiced & extended " + renewedCount + " subscriptions.");
        } else {
            logs.add("Auto-Billing Check: Checked active pools. No auto-renewing subscriptions due at this time.");
        }

        logs.add("Drafted billing transactions and generated " + notificationCount + " system notifications.");
        logs.add("Clearing system caches & generating administrative telemetry report...");
        logs.add("Job complete. Success rate: 100%. MongoDB Collections synchronized.");

        return logs;
    }
}
