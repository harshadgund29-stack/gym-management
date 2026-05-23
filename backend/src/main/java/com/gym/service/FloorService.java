package com.gym.service;

import com.gym.dto.AttendanceSummaryDTO;
import com.gym.dto.FloorSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FloorService {

    @Autowired
    private AttendanceService attendanceService;

    public FloorSummaryDTO getSummary() {
        AttendanceSummaryDTO attendance = attendanceService.getSummary();

        FloorSummaryDTO floor = new FloorSummaryDTO();
        floor.setTotalCheckInsToday(attendance.getTotalCheckInsToday());
        floor.setActiveOnFloor(attendance.getActiveOnFloor());
        floor.setCompletedSessions(attendance.getCompletedSessions());
        floor.setTotalMembers(attendance.getTotalMembers());
        floor.setRoster(attendance.getRoster());
        return floor;
    }
}
