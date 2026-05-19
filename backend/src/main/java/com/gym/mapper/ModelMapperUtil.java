package com.gym.mapper;

import com.gym.dto.UsersRequestDto;
import com.gym.dto.UsersResponseDto;
import com.gym.entity.User;

/**
 * ModelMapperUtil — maps between User entity and DTOs.
 * Uses the canonical User entity (firstName + lastName).
 */
public class ModelMapperUtil {

    public static User mapToUsersEntity(UsersRequestDto dto) {
        User user = new User();
        // UsersRequestDto has a single 'name' field — split on first space
        if (dto.getName() != null) {
            int idx = dto.getName().indexOf(' ');
            if (idx >= 0) {
                user.setFirstName(dto.getName().substring(0, idx).trim());
                user.setLastName(dto.getName().substring(idx + 1).trim());
            } else {
                user.setFirstName(dto.getName().trim());
                user.setLastName("");
            }
        }
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // raw — caller must encode
        return user;
    }

    public static UsersResponseDto mapToUsersResponseDto(User user) {
        UsersResponseDto dto = new UsersResponseDto();
        dto.setId(user.getId());
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        dto.setName(name.isEmpty() ? user.getEmail() : name);
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        return dto;
    }
}
