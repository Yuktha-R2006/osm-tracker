package com.ott.ms.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;
import java.util.Map;

@Document(collection = "subscriptions")
public class Subscription {
    @Id
    private String id;

    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String userId;

    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String platformId;

    private String subscriptionType;
    private Boolean isPremium = false;
    private String status = "active"; // 'active', 'expired', 'cancelled'
    private Integer renewalCount = 0;
    private Integer activeDays = 0;
    private Date startDate;
    private Date endDate;
    private Boolean cancelled = false;
    private Boolean autoRenew = false;

    // Compatibility fields
    @org.springframework.data.mongodb.core.mapping.Field(targetType = org.springframework.data.mongodb.core.mapping.FieldType.OBJECT_ID)
    private String ottPlatformId;
    private String planName;
    private Date expiryDate;
    private Boolean autoRenewal;
    private Boolean isCancelled;
    private Double subscriptionCost = 0.0;
    private String renewalType = "manual"; // 'auto', 'manual'
    private Date cancellationDate;
    private Date nextBillingDate;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    // Populate field (not stored in MongoDB)
    @Transient
    private Platform populatedPlatform;

    public Subscription() {}

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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPlatformId() {
        return platformId;
    }

    public void setPlatformId(String platformId) {
        this.platformId = platformId;
    }

    public String getSubscriptionType() {
        return subscriptionType;
    }

    public void setSubscriptionType(String subscriptionType) {
        this.subscriptionType = subscriptionType;
    }

    public Boolean getIsPremium() {
        return isPremium;
    }

    public void setIsPremium(Boolean isPremium) {
        this.isPremium = isPremium;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRenewalCount() {
        return renewalCount;
    }

    public void setRenewalCount(Integer renewalCount) {
        this.renewalCount = renewalCount;
    }

    public Integer getActiveDays() {
        return activeDays;
    }

    public void setActiveDays(Integer activeDays) {
        this.activeDays = activeDays;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Boolean getCancelled() {
        return cancelled;
    }

    public void setCancelled(Boolean cancelled) {
        this.cancelled = cancelled;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getAutoRenewal() {
        return autoRenewal;
    }

    public void setAutoRenewal(Boolean autoRenewal) {
        this.autoRenewal = autoRenewal;
    }

    public Boolean getIsCancelled() {
        return isCancelled;
    }

    public void setIsCancelled(Boolean isCancelled) {
        this.isCancelled = isCancelled;
    }

    public Double getSubscriptionCost() {
        return subscriptionCost;
    }

    public void setSubscriptionCost(Double subscriptionCost) {
        this.subscriptionCost = subscriptionCost;
    }

    public String getRenewalType() {
        return renewalType;
    }

    public void setRenewalType(String renewalType) {
        this.renewalType = renewalType;
    }

    public Date getCancellationDate() {
        return cancellationDate;
    }

    public void setCancellationDate(Date cancellationDate) {
        this.cancellationDate = cancellationDate;
    }

    public Date getNextBillingDate() {
        return nextBillingDate;
    }

    public void setNextBillingDate(Date nextBillingDate) {
        this.nextBillingDate = nextBillingDate;
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

    public Platform getPopulatedPlatform() {
        return populatedPlatform;
    }

    public void setPopulatedPlatform(Platform populatedPlatform) {
        this.populatedPlatform = populatedPlatform;
    }

    public String getOttPlatformIdRaw() {
        return this.ottPlatformId;
    }

    @JsonProperty("ottPlatformId")
    public Object getOttPlatformId() {
        if (this.populatedPlatform != null) {
            return this.populatedPlatform;
        }
        return this.ottPlatformId;
    }

    @JsonProperty("ottPlatformId")
    public void setOttPlatformId(Object val) {
        if (val == null) {
            this.ottPlatformId = null;
        } else if (val instanceof String) {
            this.ottPlatformId = (String) val;
        } else if (val instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) val;
            Object idVal = map.get("id");
            if (idVal != null) {
                this.ottPlatformId = idVal.toString();
            } else {
                Object underIdVal = map.get("_id");
                if (underIdVal != null) {
                    this.ottPlatformId = underIdVal.toString();
                }
            }
        }
    }
}
