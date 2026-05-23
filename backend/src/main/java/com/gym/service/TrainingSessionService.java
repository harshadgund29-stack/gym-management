package com.gym.service;

import com.gym.dto.TrainingSessionDTO;
import com.gym.entity.TrainingSession;
import com.gym.entity.User;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.TrainingSessionRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TrainingSessionService {

    @Autowired
    private TrainingSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TrainingSessionDTO> getSessionsByTrainer(Long trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", trainerId));
        return sessionRepository.findByTrainerOrderBySessionDateDesc(trainer)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TrainingSessionDTO> getSessionsByMember(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
        return sessionRepository.findByMemberOrderBySessionDateDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TrainingSessionDTO> getAllSessions() {
        return sessionRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TrainingSessionDTO createSession(TrainingSessionDTO dto) {
        User trainer = userRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getTrainerId()));
        User member = userRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getMemberId()));

        TrainingSession session = new TrainingSession();
        session.setTrainer(trainer);
        session.setMember(member);
        session.setTitle(dto.getTitle());
        session.setDescription(dto.getDescription());
        session.setSessionDate(dto.getSessionDate());
        session.setDurationMinutes(dto.getDurationMinutes());
        session.setStatus(TrainingSession.SessionStatus.SCHEDULED);

        return toDTO(sessionRepository.save(session));
    }

    @Transactional
    public TrainingSessionDTO updateSession(Long id, TrainingSessionDTO dto) {
        TrainingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingSession", "id", id));
        session.setTitle(dto.getTitle());
        session.setDescription(dto.getDescription());
        session.setSessionDate(dto.getSessionDate());
        session.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getStatus() != null) session.setStatus(dto.getStatus());
        if (dto.getNotes() != null) session.setNotes(dto.getNotes());
        return toDTO(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("TrainingSession", "id", id);
        }
        sessionRepository.deleteById(id);
    }

    private TrainingSessionDTO toDTO(TrainingSession s) {
        TrainingSessionDTO dto = new TrainingSessionDTO();
        dto.setId(s.getId());
        dto.setTrainerId(s.getTrainer().getId());
        dto.setTrainerName(s.getTrainer().getFirstName() + " " + s.getTrainer().getLastName());
        dto.setMemberId(s.getMember().getId());
        dto.setMemberName(s.getMember().getFirstName() + " " + s.getMember().getLastName());
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());
        dto.setSessionDate(s.getSessionDate());
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.setStatus(s.getStatus());
        dto.setNotes(s.getNotes());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
