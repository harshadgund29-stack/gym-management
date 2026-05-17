package com.gym.repository;

import com.gym.entity.TrainingSession;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {

    // Trainer: see all sessions they are running
    List<TrainingSession> findByTrainerOrderBySessionDateDesc(User trainer);

    // Member: see all sessions assigned to them
    List<TrainingSession> findByMemberOrderBySessionDateDesc(User member);

    // Count sessions for a trainer
    long countByTrainer(User trainer);
}
