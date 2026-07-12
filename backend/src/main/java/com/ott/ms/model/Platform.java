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

@Document(collection = "platforms")
public class Platform {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String logo = "";
    private String accentColor = "#ff0055";
    private String description = "";
    private Double monthlyPrice = 0.0;
    private Integer activeSubscribers = 0;
    private Integer cancellationRate = 0;
    private Integer premiumUsers = 0;
    private String status = "active"; // 'active' or 'inactive'

    private List<Plan> plans = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Platform() {}

    public Platform(String id, String name, String logo, String accentColor, String description, Double monthlyPrice, 
                    Integer activeSubscribers, Integer cancellationRate, Integer premiumUsers, String status, 
                    List<Plan> plans, Date createdAt, Date updatedAt) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.accentColor = accentColor;
        this.description = description;
        this.monthlyPrice = monthlyPrice;
        this.activeSubscribers = activeSubscribers;
        this.cancellationRate = cancellationRate;
        this.premiumUsers = premiumUsers;
        this.status = status;
        this.plans = plans;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(Double monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public Integer getActiveSubscribers() {
        return activeSubscribers;
    }

    public void setActiveSubscribers(Integer activeSubscribers) {
        this.activeSubscribers = activeSubscribers;
    }

    public Integer getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(Integer cancellationRate) {
        this.cancellationRate = cancellationRate;
    }

    public Integer getPremiumUsers() {
        return premiumUsers;
    }

    public void setPremiumUsers(Integer premiumUsers) {
        this.premiumUsers = premiumUsers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Plan> getPlans() {
        return plans;
    }

    public void setPlans(List<Plan> plans) {
        this.plans = plans;
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
    @JsonProperty("themeColor")
    public String getThemeColor() {
        return this.accentColor;
    }

    @JsonProperty("themeColor")
    public void setThemeColor(String themeColor) {
        this.accentColor = themeColor != null ? themeColor : "#ff0055";
    }

    @JsonProperty("subscribers")
    public Integer getSubscribers() {
        return this.activeSubscribers;
    }

    @JsonProperty("subscribers")
    public void setSubscribers(Integer subscribers) {
        this.activeSubscribers = subscribers != null ? subscribers : 0;
    }

    public static class Plan {
        private String name;
        private Double pricingMonthly;
        private Double pricingYearly;

        public Plan() {}

        public Plan(String name, Double pricingMonthly, Double pricingYearly) {
            this.name = name;
            this.pricingMonthly = pricingMonthly;
            this.pricingYearly = pricingYearly;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getPricingMonthly() {
            return pricingMonthly;
        }

        public void setPricingMonthly(Double pricingMonthly) {
            this.pricingMonthly = pricingMonthly;
        }

        public Double getPricingYearly() {
            return pricingYearly;
        }

        public void setPricingYearly(Double pricingYearly) {
            this.pricingYearly = pricingYearly;
        }
    }
}
