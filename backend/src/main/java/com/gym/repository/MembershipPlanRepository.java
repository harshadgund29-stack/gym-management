package com.gym.repository;

import com.gym.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    // Only return plans that are currently active
    List<MembershipPlan> findByActiveTrue();
}
