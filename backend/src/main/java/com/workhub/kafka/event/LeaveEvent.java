package com.workhub.kafka.event;

import java.time.LocalDate;
import java.util.UUID;

public class LeaveEvent {

    private UUID leaveId;
    private UUID employeeId;
    private String organizationId;
    private String status;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;

    public LeaveEvent() {}

    public LeaveEvent(UUID leaveId, UUID employeeId, String organizationId,
                      String status, String leaveType, LocalDate startDate,
                      LocalDate endDate, int numberOfDays) {
        this.leaveId = leaveId;
        this.employeeId = employeeId;
        this.organizationId = organizationId;
        this.status = status;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.numberOfDays = numberOfDays;
    }

    public UUID getLeaveId() { return leaveId; }
    public UUID getEmployeeId() { return employeeId; }
    public String getOrganizationId() { return organizationId; }
    public String getStatus() { return status; }
    public String getLeaveType() { return leaveType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public int getNumberOfDays() { return numberOfDays; }

    public void setLeaveId(UUID leaveId) { this.leaveId = leaveId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public void setStatus(String status) { this.status = status; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public void setNumberOfDays(int numberOfDays) { this.numberOfDays = numberOfDays; }

    @Override
    public String toString() {
        return "LeaveEvent{leaveId=" + leaveId + ", employeeId=" + employeeId +
                ", status=" + status + ", leaveType=" + leaveType + "}";
    }
}