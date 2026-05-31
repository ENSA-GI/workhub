package com.workhub.org.mapper;

import com.workhub.org.domain.Department;
import com.workhub.org.dto.DepartmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DepartmentMapper {
    DepartmentResponse toResponse(Department department);
}
