package com.workhub.leave.service;

import org.springframework.stereotype.Component;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Component
public class WorkingDaysCalculator {

    private static final Set<LocalDate> FERIES_2026 = Set.of(
            LocalDate.of(2026, 1, 1),
            LocalDate.of(2026, 1, 11),
            LocalDate.of(2026, 5, 1),
            LocalDate.of(2026, 7, 30),
            LocalDate.of(2026, 8, 14),
            LocalDate.of(2026, 8, 20),
            LocalDate.of(2026, 8, 21),
            LocalDate.of(2026, 11, 6),
            LocalDate.of(2026, 11, 18)
    );

    // Weekend Maroc = vendredi + samedi
    public int calculate(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (current.getDayOfWeek() != DayOfWeek.FRIDAY
                    && current.getDayOfWeek() != DayOfWeek.SATURDAY
                    && !FERIES_2026.contains(current)) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }
}