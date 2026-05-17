package com.gym.controller;

import com.gym.dto.TrainingSessionDTO;
import com.gym.service.TrainingSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TrainingSessionController
 * Base URL: /api/sessions
 */
@RestController
@RequestMapping("/api/sessions")
public class TrainingSessionController {

    @Autowired
    private TrainingSessionService sessionService;

    /** GET /api/sessions — Admin only */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainingSessionDTO>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    /** GET /api/sessions/trainer/{trainerId} — Trainer or Admin */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<TrainingSessionDTO>> getSessionsByTrainer(@PathVariable Long trainerId) {
        return ResponseEntity.ok(sessionService.getSessionsByTrainer(trainerId));
    }

    /** GET /api/sessions/member/{memberId} — Member or Admin */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<TrainingSessionDTO>> getSessionsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(sessionService.getSessionsByMember(memberId));
    }

    /** POST /api/sessions — Trainer or Admin */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<TrainingSessionDTO> createSession(@Valid @RequestBody TrainingSessionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(dto));
    }

    /** PUT /api/sessions/{id} — Trainer or Admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<TrainingSessionDTO> updateSession(@PathVariable Long id,
                                                             @Valid @RequestBody TrainingSessionDTO dto) {
        return ResponseEntity.ok(sessionService.updateSession(id, dto));
    }

    /** DELETE /api/sessions/{id} — Trainer or Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
