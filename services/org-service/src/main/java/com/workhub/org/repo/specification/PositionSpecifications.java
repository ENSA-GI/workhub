package com.workhub.org.repo.specification;

import com.workhub.org.domain.Position;
import com.workhub.org.domain.ProfessionalCategory;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class PositionSpecifications {

    public static Specification<Position> hasOrganizationId(UUID organizationId) {
        return (root, query, cb) -> organizationId == null ? 
                cb.conjunction() : 
                cb.equal(root.get("organizationId"), organizationId);
    }

    public static Specification<Position> hasTitle(String title) {
        return (root, query, cb) -> title == null || title.trim().isEmpty() ? 
                cb.conjunction() : 
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Position> hasCategory(ProfessionalCategory category) {
        return (root, query, cb) -> category == null ? 
                cb.conjunction() : 
                cb.equal(root.get("category"), category);
    }

    public static Specification<Position> isActive(Boolean active) {
        return (root, query, cb) -> active == null ? 
                cb.conjunction() : 
                cb.equal(root.get("active"), active);
    }
}
