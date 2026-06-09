import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">

        <!-- En-tête -->
        <div class="login-header">
          <img src="assets/logo-uchk.png" alt="UCHK" class="logo"
               onerror="this.style.display='none'">
          <h1>Université Cheikh Hamidou Kane</h1>
          <p>Plateforme de gestion universitaire</p>
        </div>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="ex: nom@uchk.sn">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Mot de passe requis</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="form.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20" class="btn-spinner"></mat-spinner>
              <span *ngIf="!loading">Se connecter</span>
            </button>

          </form>
        </mat-card-content>

        <mat-card-footer class="login-footer">
          <p>Université Cheikh Hamidou Kane &copy; {{ year }}</p>
        </mat-card-footer>

      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%);
    }
    .login-card {
      width: 420px;
      padding: 8px;
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      padding: 24px 16px 8px;
    }
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .login-header h1 {
      font-size: 18px;
      font-weight: 700;
      color: #1a237e;
      margin: 0 0 4px;
    }
    .login-header p {
      font-size: 13px;
      color: #666;
      margin: 0 0 16px;
    }
    .full-width { width: 100%; }
    .submit-btn {
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      margin-top: 8px;
    }
    .btn-spinner { display: inline-block; }
    .login-footer {
      text-align: center;
      padding: 12px;
      color: #999;
      font-size: 12px;
    }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  year = new Date().getFullYear();
  loading = false;
  hidePassword = true;

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading = false;
        const msg = err.error?.message || 'Email ou mot de passe incorrect';
        this.snack.open(msg, 'Fermer', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }
}