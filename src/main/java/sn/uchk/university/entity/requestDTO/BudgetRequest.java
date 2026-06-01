package sn.uchk.university.entity.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BudgetRequest {

    private String annee;

    private Double montantPrevisionnel;

    private Double montantRealise;

    private String noteOrientation;

    private String statut;
}