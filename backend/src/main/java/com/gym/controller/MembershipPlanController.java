package com.gym.controller;

import com.gym.dto.MembershipPlanDTO;
import com.gym.service.MembershipPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MembershipPlanController
 * Base URL: /api/plans
 */
@RestController
@RequestMapping("/api/plans")
public class MembershipPlanController {

    @Autowired
    private MembershipPlanService planService;

    /** GET /api/plans — All authenticated users can see plans */
    @GetMapping
    public ResponseEntity<List<MembershipPlanDTO>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    /** GET /api/plans/active — Active plans only */
    @GetMapping("/active")
    public ResponseEntity<List<MembershipPlanDTO>> getActivePlans() {
        return ResponseEntity.ok(planService.getActivePlans());
    }

    /** GET /api/plans/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlanDTO> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    /** POST /api/plans — Admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlanDTO> createPlan(@Valid @RequestBody MembershipPlanDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.createPlan(dto));
    }

    /** PUT /api/plans/{id} — Admin only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MembershipPlanDTO> updatePlan(@PathVariable Long id,
                                                         @Valid @RequestBody MembershipPlanDTO dto) {
        return ResponseEntity.ok(planService.updatePlan(id, dto));
    }

    /** DELETE /api/plans/{id} — Admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
