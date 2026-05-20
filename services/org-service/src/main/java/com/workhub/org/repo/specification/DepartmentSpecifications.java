package com.workhub.org.repo.specification;

import com.workhub.org.domain.Department;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class DepartmentSpecifications {

    public static Specification<Department> hasOrganizationId(UUID organizationId) {
        return (root, query, cb) -> organizationId == null ? 
                cb.conjunction() : 
                cb.equal(root.get("organizationId"), organizationId);
    }

    public static Specification<Department> hasName(String name) {
        return (root, query, cb) -> name == null || name.trim().isEmpty() ? 
                cb.conjunction() : 
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Department> isActive(Boolean active) {
        return (root, query, cb) -> active == null ? 
                cb.conjunction() : 
                cb.equal(root.get("active"), active);
    }
}
