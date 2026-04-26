package com.workhub.recruitment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name="candidates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {
    @Id
    private UUID id;

    @Column(name="user_id", nullable=false)
    private UUID userId;

    @Column(nullable=false)
    private String firstName;

    @Column(nullable=false)
    private String lastName;

    @Column(nullable=false)
    private String email;

    private String phone;
}