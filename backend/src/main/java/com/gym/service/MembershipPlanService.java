package com.gym.service;

import com.gym.dto.MembershipPlanDTO;
import com.gym.entity.MembershipPlan;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.MembershipPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MembershipPlanService {

    @Autowired
    private MembershipPlanRepository planRepository;

    public List<MembershipPlanDTO> getAllPlans() {
        return planRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MembershipPlanDTO> getActivePlans() {
        return planRepository.findByActiveTrue().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MembershipPlanDTO getPlanById(Long id) {
        return toDTO(planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id)));
    }

    public MembershipPlanDTO createPlan(MembershipPlanDTO dto) {
        MembershipPlan plan = new MembershipPlan();
        plan.setName(dto.getName());
        plan.setDescription(dto.getDescription());
        plan.setPrice(dto.getPrice());
        plan.setDurationMonths(dto.getDurationMonths());
        plan.setFeatures(dto.getFeatures());
        plan.setActive(dto.getActive() != null ? dto.getActive() : true);
        return toDTO(planRepository.save(plan));
    }

    public MembershipPlanDTO updatePlan(Long id, MembershipPlanDTO dto) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id));
        plan.setName(dto.getName());
        plan.setDescription(dto.getDescription());
        plan.setPrice(dto.getPrice());
        plan.setDurationMonths(dto.getDurationMonths());
        plan.setFeatures(dto.getFeatures());
        if (dto.getActive() != null) plan.setActive(dto.getActive());
        return toDTO(planRepository.save(plan));
    }

    public void deletePlan(Long id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("MembershipPlan", "id", id);
        }
        planRepository.deleteById(id);
    }

    private MembershipPlanDTO toDTO(MembershipPlan plan) {
        MembershipPlanDTO dto = new MembershipPlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setPrice(plan.getPrice());
        dto.setDurationMonths(plan.getDurationMonths());
        dto.setFeatures(plan.getFeatures());
        dto.setActive(plan.getActive());
        return dto;
    }
}
