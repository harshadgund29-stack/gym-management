package com.gym.service;

import com.gym.dto.CreateMembershipRequest;
import com.gym.dto.MembershipDTO;
import com.gym.entity.Membership;
import com.gym.entity.MembershipPlan;
import com.gym.entity.User;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.MembershipPlanRepository;
import com.gym.repository.MembershipRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    public List<MembershipDTO> getAllMemberships() {
        return membershipRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MembershipDTO> getMembershipsByMember(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
        return membershipRepository.findByMember(member).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MembershipDTO getMembershipById(Long id) {
        return toDTO(membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id)));
    }

    /** Admin creates a membership for a member */
    public MembershipDTO createMembership(CreateMembershipRequest request) {
        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getMemberId()));
        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", request.getPlanId()));

        Membership membership = new Membership();
        membership.setMember(member);
        membership.setPlan(plan);
        membership.setStartDate(request.getStartDate());
        // End date = start date + plan duration in months
        membership.setEndDate(request.getStartDate().plusMonths(plan.getDurationMonths()));
        membership.setStatus(Membership.MembershipStatus.ACTIVE);

        return toDTO(membershipRepository.save(membership));
    }

    /** Admin can update membership status */
    public MembershipDTO updateStatus(Long id, Membership.MembershipStatus status) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));
        membership.setStatus(status);
        return toDTO(membershipRepository.save(membership));
    }

    private MembershipDTO toDTO(Membership m) {
        MembershipDTO dto = new MembershipDTO();
        dto.setId(m.getId());
        dto.setMemberId(m.getMember().getId());
        dto.setMemberName(m.getMember().getFirstName() + " " + m.getMember().getLastName());
        dto.setPlanId(m.getPlan().getId());
        dto.setPlanName(m.getPlan().getName());
        dto.setStartDate(m.getStartDate());
        dto.setEndDate(m.getEndDate());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
