package sn.uchk.university.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sn.uchk.university.entity.requestDTO.BudgetRequest;
import sn.uchk.university.entity.responseDTO.BudgetResponse;
import sn.uchk.university.service.BudgetService;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public BudgetResponse create(@RequestBody BudgetRequest request) {
        return budgetService.create(request);
    }

    @GetMapping
    public List<BudgetResponse> findAll() {
        return budgetService.findAll();
    }

    @GetMapping("/{id}")
    public BudgetResponse findById(@PathVariable Long id) {
        return budgetService.findById(id);
    }

    @GetMapping("/annee/{annee}")
    public BudgetResponse findByAnnee(@PathVariable String annee) {
        return budgetService.findByAnnee(annee);
    }

    @GetMapping("/statut/{statut}")
    public List<BudgetResponse> findByStatut(@PathVariable String statut) {
        return budgetService.findByStatut(statut);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(
            @PathVariable Long id,
            @RequestBody BudgetRequest request
    ) {
        return budgetService.update(id, request);
    }

    @PatchMapping("/{id}/realise")
    public BudgetResponse marquerRealise(
            @PathVariable Long id,
            @RequestParam Double montantRealise
    ) {
        return budgetService.marquerRealise(id, montantRealise);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        budgetService.delete(id);
        return "Budget supprimé avec succès";
    }
}