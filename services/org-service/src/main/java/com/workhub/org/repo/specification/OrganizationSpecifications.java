package com.workhub.org.repo.specification;

import com.workhub.org.domain.Organization;
import org.springframework.data.jpa.domain.Specification;

public class OrganizationSpecifications {

    public static Specification<Organization> hasName(String name) {
        return (root, query, cb) -> name == null || name.trim().isEmpty() ? 
                cb.conjunction() : 
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Organization> hasCity(String city) {
        return (root, query, cb) -> city == null || city.trim().isEmpty() ? 
                cb.conjunction() : 
                cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%");
    }

    public static Specification<Organization> isActive(Boolean active) {
        return (root, query, cb) -> active == null ? 
                cb.conjunction() : 
                cb.equal(root.get("active"), active);
    }
}
