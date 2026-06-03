package com.workhub.leave.api;

import com.workhub.leave.domain.*;
import com.workhub.leave.repo.*;
import com.workhub.leave.dto.*;
import com.workhub.leave.service.LeaveService;
import com.workhub.leave.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveTypeRepository typeRepo;
    private final LeaveRequestRepository reqRepo;
    private final LeaveBalanceRepository balanceRepo;
    private final LeaveService leaveService;

    public LeaveController(LeaveTypeRepository typeRepo,
                           LeaveRequestRepository reqRepo,
                           LeaveBalanceRepository balanceRepo,
                           LeaveService leaveService) {
        this.typeRepo = typeRepo;
        this.reqRepo = reqRepo;
        this.balanceRepo = balanceRepo;
        this.leaveService = leaveService;
    }

    // ============ DTOs ============

    public record CreateLeaveRequest(
            @NotNull UUID employeeId,
            @NotNull UUID leaveTypeId,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            String reason
    ) {}

    public record StatusRequest(
            @NotNull LeaveStatus decision,
            String comment,
            @NotNull UUID reviewedBy
    ) {}

    // ============ LEAVE TYPES ============

    // GET /api/leave-types?organizationId=...
    @GetMapping("/leave-types")
    public List<LeaveType> leaveTypes(@RequestParam UUID organizationId) {
        SecurityUtils.validateOrganizationAccess(organizationId);
        return typeRepo.findByOrganizationId(organizationId);
    }

    // ============ LEAVE REQUESTS ============

    // GET /api/leave-requests?employeeId=...
    @GetMapping("/leave-requests")
    public List<LeaveRequestResponse> leaveRequests(@RequestParam UUID employeeId) {
        return leaveService.getByEmployee(employeeId);
    }

    // GET /api/leave-requests/pending  → vue RH
    @GetMapping("/leave-requests/pending")
    public List<LeaveRequestResponse> pending() {
        return leaveService.getPending();
    }

    // GET /api/leave-requests/{id}  → détail d'une demande
    @GetMapping("/leave-requests/all")
    public List<LeaveRequestResponse> allRequests() {
        return leaveService.getAll();
    }

    @GetMapping("/leave-requests/{id}")
    public ResponseEntity<LeaveRequest> getById(@PathVariable UUID id) {
        return reqRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/leave-requests  → employé soumet une demande
    @PostMapping("/leave-requests")
    public LeaveRequestResponse create(@RequestBody @Valid CreateLeaveRequest req) {
        LeaveRequestDTO dto = new LeaveRequestDTO(
                req.employeeId(),
                req.leaveTypeId(),
                req.startDate(),
                req.endDate(),
                req.reason()
        );
        return leaveService.submit(dto);
    }

    // PUT /api/leave-requests/{id}/status  → RH approuve ou refuse
    @PutMapping("/leave-requests/{id}/status")
    public LeaveRequestResponse updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid StatusRequest req) {
        ReviewDTO dto = new ReviewDTO(req.decision(), req.comment(), req.reviewedBy());
        return leaveService.review(id, dto);
    }

    // DELETE /api/leave-requests/{id}  → employé annule sa demande
    @DeleteMapping("/leave-requests/{id}")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        leaveService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    // ============ LEAVE BALANCES ============

    // GET /api/leave-balances?employeeId=...
    @GetMapping("/leave-balances")
    public LeaveBalanceResponse balances(@RequestParam UUID employeeId) {
        return leaveService.getBalance(employeeId, LocalDate.now().getYear());
    }

    // ============ CALENDRIER ============

    // GET /api/leave-calendar?organizationId=...  → FullCalendar vue RH
    @GetMapping("/leave-calendar")
    public List<LeaveRequest> calendar(@RequestParam UUID organizationId) {
        return reqRepo.findByStatusOrderByStartDateDesc(LeaveStatus.APPROVED);
    }

    // ============ UTILITAIRE ============

    // Calcul jours ouvrés — weekend Maroc = vendredi + samedi
    private long businessDays(LocalDate start, LocalDate end) {
        long count = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.FRIDAY && dow != DayOfWeek.SATURDAY) count++;
        }
        return count;
    }
}
