// ─── forbidden.component.ts ───────────────────────────────────────────────────
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export { };

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;gap:16px">
      <mat-icon style="font-size:80px;width:80px;height:80px;color:#e53935">lock</mat-icon>
      <h1 style="margin:0;color:#1a237e">Accès refusé</h1>
      <p style="color:#666">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <button mat-raised-button color="primary" [routerLink]="['/dashboard']">
        Retour au tableau de bord
      </button>
    </div>
  `
})
export class ForbiddenComponent {}
