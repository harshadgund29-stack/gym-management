package com.gym.controller;

import com.gym.dto.FloorSummaryDTO;
import com.gym.service.FloorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * FloorController — gym floor metrics for admin/trainer dashboards.
 * Base URL: /api/floor
 */
@RestController
@RequestMapping("/api/floor")
public class FloorController {

    @Autowired
    private FloorService floorService;

    /** GET /api/floor/summary — today's floor metrics and roster */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<FloorSummaryDTO> getFloorSummary() {
        return ResponseEntity.ok(floorService.getSummary());
    }
}
