package com.workhub.leave.service;

import com.workhub.leave.domain.*;
import com.workhub.leave.dto.*;
import com.workhub.leave.exception.LeaveException;
import com.workhub.leave.repo.*;
import com.workhub.leave.kafka.LeaveEventProducer;
import com.workhub.leave.kafka.event.LeaveEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveService {

        private final LeaveRequestRepository leaveRequestRepo;
        private final LeaveBalanceRepository leaveBalanceRepo;
        private final LeaveTypeRepository leaveTypeRepo;
        private final WorkingDaysCalculator calculator;
        private final LeaveEventProducer leaveEventProducer;

        public LeaveService(
                LeaveRequestRepository leaveRequestRepo,
                LeaveBalanceRepository leaveBalanceRepo,
                LeaveTypeRepository leaveTypeRepo,
                WorkingDaysCalculator calculator,
                LeaveEventProducer leaveEventProducer) {
                this.leaveRequestRepo = leaveRequestRepo;
                this.leaveBalanceRepo = leaveBalanceRepo;
                this.leaveTypeRepo = leaveTypeRepo;
                this.calculator = calculator;
                this.leaveEventProducer = leaveEventProducer;
        }

        @Transactional
        public LeaveRequestResponse submit(LeaveRequestDTO dto) {
                if (dto.endDate().isBefore(dto.startDate())) {
                        throw new LeaveException("La date de fin doit etre apres la date de debut");
                }

                int days = calculator.calculate(dto.startDate(), dto.endDate());
                if (days <= 0) {
                        throw new LeaveException("La periode selectionnee ne contient aucun jour ouvrable");
                }

                LeaveBalance balance = leaveBalanceRepo
                        .findByEmployeeIdAndYear(dto.employeeId(), dto.startDate().getYear())
                        .orElseThrow(() -> new LeaveException("Solde introuvable pour cet employé"));

                if (balance.getRemainingDays().intValue() < days) {
                        throw new LeaveException("Solde insuffisant : " + days + " jours demandés, "
                                + balance.getRemainingDays() + " disponibles");
                }

                LeaveType type = leaveTypeRepo.findById(dto.leaveTypeId())
                        .orElseThrow(() -> new LeaveException("Type de congé introuvable"));

                boolean overlaps = leaveRequestRepo
                        .findByEmployeeIdAndStatus(dto.employeeId(), LeaveStatus.PENDING)
                        .stream()
                        .anyMatch(r -> !dto.endDate().isBefore(r.getStartDate())
                                && !dto.startDate().isAfter(r.getEndDate()));
                if (!overlaps) {
                        overlaps = leaveRequestRepo
                                .findByEmployeeIdAndStatus(dto.employeeId(), LeaveStatus.APPROVED)
                                .stream()
                                .anyMatch(r -> !dto.endDate().isBefore(r.getStartDate())
                                        && !dto.startDate().isAfter(r.getEndDate()));
                }
                if (overlaps) {
                        throw new LeaveException("Une demande existe deja sur cette periode");
                }

                LeaveRequest request = LeaveRequest.builder()
                        .id(UUID.randomUUID())
                        .employeeId(dto.employeeId())
                        .leaveTypeId(dto.leaveTypeId())
                        .startDate(dto.startDate())
                        .endDate(dto.endDate())
                        .requestedDays(BigDecimal.valueOf(days))
                        .reason(dto.reason())
                        .status(LeaveStatus.PENDING)
                        .build();

                leaveRequestRepo.save(request);

                // Publier événement Kafka
                leaveEventProducer.publish(new LeaveEvent(
                        "LeaveRequested",
                        request.getId(),
                        request.getEmployeeId(),
                        type.getName(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getRequestedDays(),
                        request.getStatus(),
                        null
                ));

                balance.setPendingDays(balance.getPendingDays().add(BigDecimal.valueOf(days)));
                balance.setRemainingDays(balance.getRemainingDays().subtract(BigDecimal.valueOf(days)));
                balance.setUpdatedAt(LocalDateTime.now());
                leaveBalanceRepo.save(balance);

                return toResponse(request, type.getName());
        }

        @Transactional
        public void cancel(UUID requestId) {
                LeaveRequest request = leaveRequestRepo.findById(requestId)
                        .orElseThrow(() -> new LeaveException("Demande introuvable"));

                if (request.getStatus() != LeaveStatus.PENDING) {
                        throw new LeaveException("Seule une demande en attente peut etre annulee");
                }

                LeaveBalance balance = leaveBalanceRepo
                        .findByEmployeeIdAndYear(request.getEmployeeId(), request.getStartDate().getYear())
                        .orElseThrow(() -> new LeaveException("Solde introuvable"));

                request.setStatus(LeaveStatus.CANCELLED);

                leaveRequestRepo.save(request);
                recalculateAndSaveBalance(balance);
        }

        @Transactional
        public LeaveRequestResponse review(UUID requestId, ReviewDTO dto) {
                LeaveRequest request = leaveRequestRepo.findById(requestId)
                        .orElseThrow(() -> new LeaveException("Demande introuvable"));

                if (request.getStatus() != LeaveStatus.PENDING) {
                        throw new LeaveException("Cette demande a déjà été traitée");
                }

                LeaveBalance balance = leaveBalanceRepo
                        .findByEmployeeIdAndYear(
                                request.getEmployeeId(),
                                request.getStartDate().getYear())
                        .orElseThrow(() -> new LeaveException("Solde introuvable"));

                request.setStatus(dto.decision());
                request.setReviewedBy(dto.reviewedBy());
                request.setReviewComment(dto.comment());

                        // Refusé → remettre les jours
                leaveRequestRepo.save(request);
                recalculateAndSaveBalance(balance);

                LeaveType type = leaveTypeRepo.findById(request.getLeaveTypeId()).orElseThrow();

                // Publier événement Kafka
                String eventType = dto.decision() == LeaveStatus.APPROVED
                        ? "LeaveApproved"
                        : "LeaveRejected";

                leaveEventProducer.publish(new LeaveEvent(
                        eventType,
                        request.getId(),
                        request.getEmployeeId(),
                        type.getName(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getRequestedDays(),
                        request.getStatus(),
                        dto.comment()
                ));

                return toResponse(request, type.getName());
        }

        public List<LeaveRequestResponse> getByEmployee(UUID employeeId) {
                return leaveRequestRepo
                        .findByEmployeeIdOrderByStartDateDesc(employeeId)
                        .stream()
                        .map(r -> {
                                String typeName = leaveTypeRepo.findById(r.getLeaveTypeId())
                                        .map(LeaveType::getName).orElse("Inconnu");
                                return toResponse(r, typeName);
                        }).toList();
        }

        public List<LeaveRequestResponse> getPending() {
                return leaveRequestRepo
                        .findByStatusOrderByStartDateDesc(LeaveStatus.PENDING)
                        .stream()
                        .map(r -> {
                                String typeName = leaveTypeRepo.findById(r.getLeaveTypeId())
                                        .map(LeaveType::getName).orElse("Inconnu");
                                return toResponse(r, typeName);
                        }).toList();
        }

        public List<LeaveRequestResponse> getAll() {
                return leaveRequestRepo
                        .findAllByOrderByStartDateDesc()
                        .stream()
                        .map(r -> {
                                String typeName = leaveTypeRepo.findById(r.getLeaveTypeId())
                                        .map(LeaveType::getName).orElse("Inconnu");
                                return toResponse(r, typeName);
                        }).toList();
        }

        public LeaveBalanceResponse getBalance(UUID employeeId, int year) {
                LeaveBalance b = leaveBalanceRepo
                        .findByEmployeeIdAndYear(employeeId, year)
                        .orElseThrow(() -> new LeaveException("Solde introuvable"));
                LeaveBalance recalculated = recalculateAndSaveBalance(b);

                return new LeaveBalanceResponse(
                        recalculated.getYear(), recalculated.getTotalDays(), recalculated.getUsedDays(),
                        recalculated.getPendingDays(), recalculated.getRemainingDays(), recalculated.getCarriedOverDays()
                );
        }

        private LeaveBalance recalculateAndSaveBalance(LeaveBalance balance) {
                List<LeaveRequest> yearlyRequests = leaveRequestRepo
                        .findByEmployeeIdOrderByStartDateDesc(balance.getEmployeeId())
                        .stream()
                        .filter(r -> r.getStartDate().getYear() == balance.getYear())
                        .toList();

                BigDecimal usedDays = yearlyRequests.stream()
                        .filter(r -> r.getStatus() == LeaveStatus.APPROVED)
                        .map(LeaveRequest::getRequestedDays)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal pendingDays = yearlyRequests.stream()
                        .filter(r -> r.getStatus() == LeaveStatus.PENDING)
                        .map(LeaveRequest::getRequestedDays)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal remainingDays = balance.getTotalDays()
                        .add(balance.getCarriedOverDays())
                        .subtract(usedDays)
                        .subtract(pendingDays);

                balance.setUsedDays(usedDays);
                balance.setPendingDays(pendingDays);
                balance.setRemainingDays(remainingDays.max(BigDecimal.ZERO));
                balance.setUpdatedAt(LocalDateTime.now());
                return leaveBalanceRepo.save(balance);
        }

        private LeaveRequestResponse toResponse(LeaveRequest r, String typeName) {
                return new LeaveRequestResponse(
                        r.getId(), r.getEmployeeId(), typeName,
                        r.getStartDate(), r.getEndDate(),
                        r.getRequestedDays(), r.getReason(),
                        r.getStatus(), r.getReviewComment()
                );
        }
}
