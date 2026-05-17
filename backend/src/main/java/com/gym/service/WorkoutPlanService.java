package com.gym.service;

import com.gym.dto.WorkoutPlanDTO;
import com.gym.entity.User;
import com.gym.entity.WorkoutPlan;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.UserRepository;
import com.gym.repository.WorkoutPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutPlanService {

    @Autowired
    private WorkoutPlanRepository workoutPlanRepository;

    @Autowired
    private UserRepository userRepository;

    public List<WorkoutPlanDTO> getPlansByTrainer(Long trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", trainerId));
        return workoutPlanRepository.findByTrainerOrderByCreatedAtDesc(trainer)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<WorkoutPlanDTO> getPlansByMember(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
        return workoutPlanRepository.findByMemberOrderByCreatedAtDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public WorkoutPlanDTO getPlanById(Long id) {
        return toDTO(workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", id)));
    }

    public WorkoutPlanDTO createPlan(WorkoutPlanDTO dto) {
        User trainer = userRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getTrainerId()));
        User member = userRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getMemberId()));

        WorkoutPlan plan = new WorkoutPlan();
        plan.setTrainer(trainer);
        plan.setMember(member);
        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setExercises(dto.getExercises());
        plan.setGoal(dto.getGoal());
        plan.setWeekDuration(dto.getWeekDuration());

        return toDTO(workoutPlanRepository.save(plan));
    }

    public WorkoutPlanDTO updatePlan(Long id, WorkoutPlanDTO dto) {
        WorkoutPlan plan = workoutPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", id));
        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setExercises(dto.getExercises());
        plan.setGoal(dto.getGoal());
        plan.setWeekDuration(dto.getWeekDuration());
        return toDTO(workoutPlanRepository.save(plan));
    }

    public void deletePlan(Long id) {
        if (!workoutPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("WorkoutPlan", "id", id);
        }
        workoutPlanRepository.deleteById(id);
    }

    private WorkoutPlanDTO toDTO(WorkoutPlan p) {
        WorkoutPlanDTO dto = new WorkoutPlanDTO();
        dto.setId(p.getId());
        dto.setTrainerId(p.getTrainer().getId());
        dto.setTrainerName(p.getTrainer().getFirstName() + " " + p.getTrainer().getLastName());
        dto.setMemberId(p.getMember().getId());
        dto.setMemberName(p.getMember().getFirstName() + " " + p.getMember().getLastName());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setExercises(p.getExercises());
        dto.setGoal(p.getGoal());
        dto.setWeekDuration(p.getWeekDuration());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
