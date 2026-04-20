package com.workhub.leave.api;

import com.workhub.leave.domain.LeaveBalance;
import com.workhub.leave.domain.LeaveRequest;
import com.workhub.leave.domain.LeaveStatus;
import com.workhub.leave.domain.LeaveType;
import com.workhub.leave.repo.LeaveBalanceRepository;
import com.workhub.leave.repo.LeaveRequestRepository;
import com.workhub.leave.repo.LeaveTypeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LeaveController {

    private final LeaveTypeRepository typeRepo;
    private final LeaveRequestRepository reqRepo;
    private final LeaveBalanceRepository balanceRepo;

    public LeaveController(LeaveTypeRepository typeRepo, LeaveRequestRepository reqRepo, LeaveBalanceRepository balanceRepo) {
        this.typeRepo = typeRepo;
        this.reqRepo = reqRepo;
        this.balanceRepo = balanceRepo;
    }

    public record CreateLeaveRequest(
            @NotNull UUID employeeId,
            @NotNull UUID leaveTypeId,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            String reason
    ) {}

    @GetMapping("/leave-types")
    public List<LeaveType> leaveTypes(@RequestParam UUID organizationId) {
        return typeRepo.findByOrganizationId(organizationId);
    }

    @GetMapping("/leave-requests")
    public List<LeaveRequest> leaveRequests(@RequestParam UUID employeeId) {
        return reqRepo.findByEmployeeId(employeeId);
    }

    @PostMapping("/leave-requests")
    public LeaveRequest create(@RequestBody @Valid CreateLeaveRequest req) {
        BigDecimal days = BigDecimal.valueOf(businessDays(req.startDate(), req.endDate()));
        LeaveRequest lr = LeaveRequest.builder()
                .id(UUID.randomUUID())
                .employeeId(req.employeeId())
                .leaveTypeId(req.leaveTypeId())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .requestedDays(days)
                .reason(req.reason())
                .status(LeaveStatus.PENDING)
                .build();
        return reqRepo.save(lr);
    }

    @GetMapping("/leave-balances")
    public List<LeaveBalance> balances(@RequestParam UUID employeeId) {
        return balanceRepo.findByEmployeeId(employeeId);
    }

    private long businessDays(LocalDate start, LocalDate end) {
        long count = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) count++;
        }
        return count;
    }
}