package com.gym.repository;

import com.gym.entity.User;
import com.gym.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    // Trainer: see all plans they created
    List<WorkoutPlan> findByTrainerOrderByCreatedAtDesc(User trainer);

    // Member: see all plans assigned to them
    List<WorkoutPlan> findByMemberOrderByCreatedAtDesc(User member);
}
