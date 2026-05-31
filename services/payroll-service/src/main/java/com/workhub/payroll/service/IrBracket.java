package com.workhub.payroll.domain;

import java.math.BigDecimal;

public record IrBracket(
        BigDecimal min,
        BigDecimal max,
        BigDecimal rate
) {}