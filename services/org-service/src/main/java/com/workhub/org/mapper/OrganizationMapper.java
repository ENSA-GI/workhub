package com.workhub.org.mapper;

import com.workhub.org.domain.Organization;
import com.workhub.org.dto.OrganizationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OrganizationMapper {
    OrganizationResponse toResponse(Organization organization);
}
