package com.gym.service;

import com.gym.dto.CreatePaymentRequest;
import com.gym.dto.PaymentDTO;
import com.gym.entity.Membership;
import com.gym.entity.Payment;
import com.gym.entity.User;
import com.gym.exception.ResourceNotFoundException;
import com.gym.repository.MembershipRepository;
import com.gym.repository.PaymentRepository;
import com.gym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByMember(Long memberId) {
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", memberId));
        return paymentRepository.findByMemberOrderByPaymentDateDesc(member)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PaymentDTO createPayment(CreatePaymentRequest request) {
        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getMemberId()));
        Membership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", request.getMembershipId()));

        Payment payment = new Payment();
        payment.setMember(member);
        payment.setMembership(membership);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);

        return toDTO(paymentRepository.save(payment));
    }

    private PaymentDTO toDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setMemberId(p.getMember().getId());
        dto.setMemberName(p.getMember().getFirstName() + " " + p.getMember().getLastName());
        dto.setMembershipId(p.getMembership().getId());
        dto.setPlanName(p.getMembership().getPlan().getName());
        dto.setAmount(p.getAmount());
        dto.setStatus(p.getStatus());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionId(p.getTransactionId());
        dto.setPaymentDate(p.getPaymentDate());
        return dto;
    }
}
