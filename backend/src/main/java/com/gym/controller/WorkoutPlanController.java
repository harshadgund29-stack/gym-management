package com.gym.controller;

import com.gym.dto.WorkoutPlanDTO;
import com.gym.service.WorkoutPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WorkoutPlanController
 * Base URL: /api/workout-plans
 */
@RestController
@RequestMapping("/api/workout-plans")
public class WorkoutPlanController {

    @Autowired
    private WorkoutPlanService workoutPlanService;

    /** GET /api/workout-plans — Admin only: list all plans */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WorkoutPlanDTO>> getAllPlans() {
        return ResponseEntity.ok(workoutPlanService.getAllPlans());
    }

    /** GET /api/workout-plans/trainer/{trainerId} — Trainer or Admin */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<WorkoutPlanDTO>> getPlansByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(workoutPlanService.getPlansByTrainer(trainerId));
    }

    /** GET /api/workout-plans/member/{memberId} — Member, Trainer, or Admin */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<List<WorkoutPlanDTO>> getPlansByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(workoutPlanService.getPlansByMember(memberId));
    }

    /** GET /api/workout-plans/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlanDTO> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(workoutPlanService.getPlanById(id));
    }

    /** POST /api/workout-plans — Trainer or Admin */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<WorkoutPlanDTO> createPlan(@Valid @RequestBody WorkoutPlanDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutPlanService.createPlan(dto));
    }

    /** PUT /api/workout-plans/{id} — Trainer or Admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<WorkoutPlanDTO> updatePlan(@PathVariable Long id,
                                                      @Valid @RequestBody WorkoutPlanDTO dto) {
        return ResponseEntity.ok(workoutPlanService.updatePlan(id, dto));
    }

    /** DELETE /api/workout-plans/{id} — Trainer or Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        workoutPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
