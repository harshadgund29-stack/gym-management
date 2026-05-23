package com.gym.controller;

import com.gym.dto.WorkoutPlanAssignRequest;
import com.gym.dto.WorkoutPlanDTO;
import com.gym.service.WorkoutPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WorkoutController — assign and view workout plans per member.
 * Base URL: /api/workout
 */
@RestController
@RequestMapping("/api/workout")
public class WorkoutController {

    @Autowired
    private WorkoutPlanService workoutPlanService;

    /** POST /api/workout/assign — Trainer assigns a plan to a member */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<Map<String, String>> assignPlan(@Valid @RequestBody WorkoutPlanAssignRequest request) {
        workoutPlanService.assignPlanToMember(request);
        Map<String, String> body = new HashMap<>();
        body.put("message", "Workout plan assigned successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /** GET /api/workout/member/{memberId} — Plans assigned to a member */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<List<WorkoutPlanDTO>> getPlansForMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(workoutPlanService.getPlansForMember(memberId));
    }
}
