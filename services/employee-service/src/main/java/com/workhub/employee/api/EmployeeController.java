package com.workhub.employee.api;

import com.workhub.employee.domain.EmployeeStatus;
import com.workhub.employee.dto.*;
import com.workhub.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request,
                                                   @RequestHeader(value = "X-User-Id", required = false) String userId) {
        UUID createdBy = userId != null ? UUID.fromString(userId) : null;
        EmployeeResponse response = employeeService.createEmployee(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(@PathVariable UUID id,
                                                   @RequestParam UUID organizationId,
                                                   @Valid @RequestBody UpdateEmployeeRequest request,
                                                   @RequestHeader(value = "X-User-Id", required = false) String userId) {
        UUID updatedBy = userId != null ? UUID.fromString(userId) : null;
        EmployeeResponse response = employeeService.updateEmployee(id, organizationId, request, updatedBy);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archive(@PathVariable UUID id,
                                        @RequestParam UUID organizationId,
                                        @Valid @RequestBody ArchiveEmployeeRequest request,
                                        @RequestHeader(value = "X-User-Id", required = false) String userId) {
        UUID archivedBy = userId != null ? UUID.fromString(userId) : null;
        employeeService.archiveEmployee(id, organizationId, request, archivedBy);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable UUID id,
                                                    @RequestParam UUID organizationId) {
        EmployeeResponse response = employeeService.getEmployee(id, organizationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeResponse>> list(@RequestParam UUID organizationId,
                                                       @RequestParam(defaultValue = "ACTIVE") EmployeeStatus status,
                                                       Pageable pageable) {
        Page<EmployeeResponse> response = employeeService.listEmployees(organizationId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<EmployeeResponse>> search(@RequestParam UUID organizationId,
                                                         @RequestParam String query,
                                                         @RequestParam(defaultValue = "ACTIVE") EmployeeStatus status,
                                                         Pageable pageable) {
        Page<EmployeeResponse> response = employeeService.searchEmployees(organizationId, query, status, pageable);
        return ResponseEntity.ok(response);
    }
}