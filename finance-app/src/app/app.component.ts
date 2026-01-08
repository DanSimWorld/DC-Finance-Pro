import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FinanceService } from './services/finance.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    @if (!financeService.isAuthenticated()) {
      <div class="auth-overlay">
        <div class="auth-card">
          <div class="auth-header">
            <img src="./dclogo.png" alt="DC Logo" class="app-logo">
            <h2>DC Finance Pro</h2>
            <p>{{ !financeService.settings()?.isSetup ? 'Stel je administratie in' : 'Welkom terug' }}</p>
          </div>

          @if (!financeService.settings()?.isSetup) {
            <div class="auth-form">
              <div class="input-group">
                <label>Bedrijfsnaam</label>
                <input #setupName type="text" placeholder="Bijv. Coaching Praktijk X">
              </div>
              <div class="input-group">
                <label>Kies pincode (4 cijfers)</label>
                <input #setupPin type="password" maxlength="4" placeholder="****">
              </div>
              <button class="btn-primary" (click)="financeService.setupAccount(setupName.value, setupPin.value)">
                Start Administratie
              </button>
            </div>
          } @else {
            <div class="auth-form">
              <p class="company-name"><strong>{{ financeService.settings()?.companyName }}</strong></p>
              <div class="input-group">
                <input #loginPin type="password" maxlength="4" placeholder="Voer pincode in"
                       (keyup.enter)="onPinSubmit(loginPin.value)" autofocus>
              </div>
              @if (loginError()) {
                <p class="error-msg">Onjuiste pincode</p>
              }
              <button class="btn-primary" (click)="onPinSubmit(loginPin.value)">Inloggen</button>
            </div>
          }
        </div>
      </div>
    }

    @else {
      <div class="app-wrapper">
        <nav class="top-nav">
          <div class="nav-left">
            <img src="./dclogo.png" alt="DC Logo" class="nav-logo">
            <div class="brand-info">
              <span class="logo-text">DC Finance Pro</span>
              <span class="company-sub">{{ financeService.settings()?.companyName }}</span>
            </div>
          </div>
          <div class="nav-links">
            <button routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</button>
            <button routerLink="/add" routerLinkActive="active">➕ Transactie</button>
            <button routerLink="/hours" routerLinkActive="active">⏱️ Uren</button>
            <button routerLink="/aangifte" routerLinkActive="active">📋 Aangifte</button>
            <button routerLink="/fiscal" routerLinkActive="active">⚖️ Fiscaal</button>
            <button routerLink="/exports" routerLinkActive="active">📤 Export</button>
            <button (click)="financeService.isAuthenticated.set(false)" class="btn-lock">🔒</button>
          </div>
        </nav>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    }
  `,
  styles: [`
    :host { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

    /* AUTH STYLING (Licht) */
    .auth-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #f4f7f9; display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .auth-card {
      background: white; padding: 2.5rem; border-radius: 12px;
      width: 100%; max-width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #e1e8ed; text-align: center;
    }
    .app-logo { max-height: 100px; margin-bottom: 0; object-fit: contain; }
    .btn-primary {
      width: 100%; padding: 12px; background: #007bff; color: white;
      border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
    }

    /* NAV STYLING (Terug naar Donker / #333) */
    .top-nav {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 2rem; background: #333; color: white;
    }
    .nav-left { display: flex; align-items: center; gap: 15px; }
    .nav-logo { height: 60px; width: auto; filter: brightness(0) invert(1); } /* Maakt logo wit voor donkere balk */

    .brand-info { display: flex; flex-direction: column; }
    .logo-text { font-weight: bold; font-size: 1.1rem; letter-spacing: 0.5px; }
    .company-sub { font-size: 0.75rem; color: #aaa; }

    .nav-links { display: flex; gap: 10px; align-items: center; }
    .nav-links button {
      padding: 8px 15px; border: none; background: #444; color: #eee;
      cursor: pointer; border-radius: 4px; font-size: 0.9rem; transition: 0.2s;
      &:hover { background: #555; color: white; }
      &.active { background: #28a745 !important; color: white; font-weight: 600; }
    }
    .btn-lock { background: #c53030 !important; margin-left: 10px !important; }

    .main-content { background: #f4f7f9; min-height: calc(100vh - 65px); padding: 0; }

    input {
      width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;
      margin-bottom: 10px; box-sizing: border-box;
    }
    .error-msg { color: #dc3545; font-size: 0.85rem; }
  `]
})
export class AppComponent {
  financeService = inject(FinanceService);
  loginError = signal(false);

  onPinSubmit(pin: string) {
    const success = this.financeService.login(pin);
    if (!success) {
      this.loginError.set(true);
      setTimeout(() => this.loginError.set(false), 2000);
    }
  }
}
