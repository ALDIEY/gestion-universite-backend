package sn.uchk.university.entity.responseDTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class BudgetResponse {

    private Long id;

    private String annee;

    private Double montantPrevisionnel;

    private Double montantRealise;

    private Double ecart;

    private String noteOrientation;

    private String statut;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}