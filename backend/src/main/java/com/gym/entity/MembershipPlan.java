package com.gym.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "membership_plans")
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "packingPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal packingPrice = BigDecimal.valueOf(0.00);

    @Column(nullable = false)
    private Integer durationMonths;


    private String features;

    @Column(nullable = false)
    private Boolean active = true;

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getPackingPrice() { return packingPrice; }
    public void setPackingPrice(BigDecimal packingPrice) { this.packingPrice = packingPrice; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }


    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
