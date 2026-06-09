// ─── not-found.component.ts ───────────────────────────────────────────────────
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;gap:16px">
      <mat-icon style="font-size:80px;width:80px;height:80px;color:#bbb">search_off</mat-icon>
      <h1 style="margin:0;color:#1a237e">Page introuvable</h1>
      <p style="color:#666">La page que vous cherchez n'existe pas.</p>
      <button mat-raised-button color="primary" [routerLink]="['/dashboard']">
        Retour au tableau de bord
      </button>
    </div>
  `
})
export class NotFoundComponent {}
