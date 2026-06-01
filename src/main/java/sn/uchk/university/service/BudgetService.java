package sn.uchk.university.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sn.uchk.university.entity.Budget;
import sn.uchk.university.entity.requestDTO.BudgetRequest;
import sn.uchk.university.entity.responseDTO.BudgetResponse;
import sn.uchk.university.repository.BudgetRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetResponse create(BudgetRequest request) {

        if (budgetRepository.existsByAnnee(request.getAnnee())) {
            throw new RuntimeException("Un budget existe déjà pour cette année");
        }

        Double ecart = calculerEcart(request.getMontantPrevisionnel(), request.getMontantRealise());

        Budget budget = Budget.builder()
                .annee(request.getAnnee())
                .montantPrevisionnel(request.getMontantPrevisionnel())
                .montantRealise(request.getMontantRealise())
                .ecart(ecart)
                .noteOrientation(request.getNoteOrientation())
                .statut(request.getStatut() != null ? request.getStatut() : "PREVISIONNEL")
                .build();

        return mapToResponse(budgetRepository.save(budget));
    }

    public List<BudgetResponse> findAll() {
        return budgetRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public BudgetResponse findById(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));

        return mapToResponse(budget);
    }

    public BudgetResponse findByAnnee(String annee) {
        Budget budget = budgetRepository.findByAnnee(annee)
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));

        return mapToResponse(budget);
    }

    public List<BudgetResponse> findByStatut(String statut) {
        return budgetRepository.findByStatut(statut)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public BudgetResponse update(Long id, BudgetRequest request) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));

        budget.setAnnee(request.getAnnee());
        budget.setMontantPrevisionnel(request.getMontantPrevisionnel());
        budget.setMontantRealise(request.getMontantRealise());
        budget.setEcart(calculerEcart(request.getMontantPrevisionnel(), request.getMontantRealise()));
        budget.setNoteOrientation(request.getNoteOrientation());
        budget.setStatut(request.getStatut());

        return mapToResponse(budgetRepository.save(budget));
    }

    public BudgetResponse marquerRealise(Long id, Double montantRealise) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));

        budget.setMontantRealise(montantRealise);
        budget.setEcart(calculerEcart(budget.getMontantPrevisionnel(), montantRealise));
        budget.setStatut("REALISE");

        return mapToResponse(budgetRepository.save(budget));
    }

    public void delete(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new RuntimeException("Budget introuvable");
        }

        budgetRepository.deleteById(id);
    }

    private Double calculerEcart(Double montantPrevisionnel, Double montantRealise) {
        double previsionnel = montantPrevisionnel != null ? montantPrevisionnel : 0;
        double realise = montantRealise != null ? montantRealise : 0;

        return realise - previsionnel;
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .annee(budget.getAnnee())
                .montantPrevisionnel(budget.getMontantPrevisionnel())
                .montantRealise(budget.getMontantRealise())
                .ecart(budget.getEcart())
                .noteOrientation(budget.getNoteOrientation())
                .statut(budget.getStatut())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}