package com.gym.repository;

import com.gym.entity.Membership;
import com.gym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    // Get all memberships for a specific member
    List<Membership> findByMember(User member);

    // Get the active membership for a member (there should only be one)
    Optional<Membership> findByMemberAndStatus(User member, Membership.MembershipStatus status);

    // Admin: count active memberships
    long countByStatus(Membership.MembershipStatus status);
}
