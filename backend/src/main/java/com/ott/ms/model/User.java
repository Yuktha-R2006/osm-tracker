package com.ott.ms.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private Long numericId;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String role = "user"; // 'user' or 'admin'
    private String avatar = "";
    private String membershipType = "standard"; // 'standard' or 'premium'
    private Integer activeDays = 0;
    private Integer renewalCount = 0;
    private String preferredPlatform = "";
    private String currencyPreference = "USD";
    private Boolean darkMode = true;
    
    private Date joinedDate = new Date();
    private Date lastActive = new Date();
    private Boolean isActive = true;
    private Boolean emailNotifications = true;
    private Boolean autoRenewalAlerts = true;

    private Integer totalWatchTime = 0; // in minutes
    private List<WatchHistoryItem> watchHistory = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public User() {}

    public User(String id, Long numericId, String name, String email, String password, String role, String avatar, 
                String membershipType, Integer activeDays, Integer renewalCount, String preferredPlatform, 
                String currencyPreference, Boolean darkMode, Date joinedDate, Date lastActive, Boolean isActive, 
                Boolean emailNotifications, Boolean autoRenewalAlerts, Integer totalWatchTime, 
                List<WatchHistoryItem> watchHistory, Date createdAt, Date updatedAt) {
        this.id = id;
        this.numericId = numericId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatar = avatar;
        this.membershipType = membershipType;
        this.activeDays = activeDays;
        this.renewalCount = renewalCount;
        this.preferredPlatform = preferredPlatform;
        this.currencyPreference = currencyPreference;
        this.darkMode = darkMode;
        this.joinedDate = joinedDate;
        this.lastActive = lastActive;
        this.isActive = isActive;
        this.emailNotifications = emailNotifications;
        this.autoRenewalAlerts = autoRenewalAlerts;
        this.totalWatchTime = totalWatchTime;
        this.watchHistory = watchHistory;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    public Long getNumericId() {
        return numericId;
    }

    public void setNumericId(Long numericId) {
        this.numericId = numericId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getMembershipType() {
        return membershipType;
    }

    public void setMembershipType(String membershipType) {
        this.membershipType = membershipType;
    }

    public Integer getActiveDays() {
        return activeDays;
    }

    public void setActiveDays(Integer activeDays) {
        this.activeDays = activeDays;
    }

    public Integer getRenewalCount() {
        return renewalCount;
    }

    public void setRenewalCount(Integer renewalCount) {
        this.renewalCount = renewalCount;
    }

    public String getPreferredPlatform() {
        return preferredPlatform;
    }

    public void setPreferredPlatform(String preferredPlatform) {
        this.preferredPlatform = preferredPlatform;
    }

    public String getCurrencyPreference() {
        return currencyPreference;
    }

    public void setCurrencyPreference(String currencyPreference) {
        this.currencyPreference = currencyPreference;
    }

    public Boolean getDarkMode() {
        return darkMode;
    }

    public void setDarkMode(Boolean darkMode) {
        this.darkMode = darkMode;
    }

    public Date getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(Date joinedDate) {
        this.joinedDate = joinedDate;
    }

    public Date getLastActive() {
        return lastActive;
    }

    public void setLastActive(Date lastActive) {
        this.lastActive = lastActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getAutoRenewalAlerts() {
        return autoRenewalAlerts;
    }

    public void setAutoRenewalAlerts(Boolean autoRenewalAlerts) {
        this.autoRenewalAlerts = autoRenewalAlerts;
    }

    public Integer getTotalWatchTime() {
        return totalWatchTime;
    }

    public void setTotalWatchTime(Integer totalWatchTime) {
        this.totalWatchTime = totalWatchTime;
    }

    public List<WatchHistoryItem> getWatchHistory() {
        return watchHistory;
    }

    public void setWatchHistory(List<WatchHistoryItem> watchHistory) {
        this.watchHistory = watchHistory;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Virtual compatibility properties for JSON serialization
    @JsonProperty("profileImage")
    public String getProfileImage() {
        return this.avatar;
    }

    @JsonProperty("profileImage")
    public void setProfileImage(String profileImage) {
        this.avatar = profileImage != null ? profileImage : "";
    }

    @JsonProperty("favoriteOTT")
    public String getFavoriteOTT() {
        return this.preferredPlatform;
    }

    @JsonProperty("favoriteOTT")
    public void setFavoriteOTT(String favoriteOTT) {
        this.preferredPlatform = favoriteOTT != null ? favoriteOTT : "";
    }

    @JsonProperty("totalRenewals")
    public Integer getTotalRenewals() {
        return this.renewalCount;
    }

    @JsonProperty("totalRenewals")
    public void setTotalRenewals(Integer totalRenewals) {
        this.renewalCount = totalRenewals != null ? totalRenewals : 0;
    }

    @JsonProperty("activeSubscriptionDays")
    public Integer getActiveSubscriptionDays() {
        return this.activeDays;
    }

    @JsonProperty("activeSubscriptionDays")
    public void setActiveSubscriptionDays(Integer activeSubscriptionDays) {
        this.activeDays = activeSubscriptionDays != null ? activeSubscriptionDays : 0;
    }

    @JsonProperty("isPremium")
    public Boolean getIsPremium() {
        return "premium".equalsIgnoreCase(this.membershipType);
    }

    @JsonProperty("isPremium")
    public void setIsPremium(Boolean isPremium) {
        this.membershipType = Boolean.TRUE.equals(isPremium) ? "premium" : "standard";
    }

    public static class WatchHistoryItem {
        private String title;
        private Integer duration;
        private Date watchDate;
        private String platformName;

        public WatchHistoryItem() {}

        public WatchHistoryItem(String title, Integer duration, Date watchDate, String platformName) {
            this.title = title;
            this.duration = duration;
            this.watchDate = watchDate;
            this.platformName = platformName;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Integer getDuration() {
            return duration;
        }

        public void setDuration(Integer duration) {
            this.duration = duration;
        }

        public Date getWatchDate() {
            return watchDate;
        }

        public void setWatchDate(Date watchDate) {
            this.watchDate = watchDate;
        }

        public String getPlatformName() {
            return platformName;
        }

        public void setPlatformName(String platformName) {
            this.platformName = platformName;
        }
    }
}
