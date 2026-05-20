package com.workhub.org.mapper;

import com.workhub.org.domain.Position;
import com.workhub.org.dto.PositionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PositionMapper {
    PositionResponse toResponse(Position position);
}
