import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nodig voor *ngIf
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, DashboardComponent],
  template: `
    <div class="main-layout">
      <nav class="top-nav">
        <h1>NK Finance Pro</h1>
        <div class="nav-links">
          <button (click)="view = 'form'" [class.active]="view === 'form'">➕ Toevoegen</button>
          <button (click)="view = 'dash'" [class.active]="view === 'dash'">📊 Dashboard</button>
        </div>
      </nav>

      <main class="content">
        <app-transaction-form *ngIf="view === 'form'"></app-transaction-form>
        <app-dashboard *ngIf="view === 'dash'"></app-dashboard>
      </main>
    </div>
  `,
  styles: [`
    .main-layout { font-family: sans-serif; }
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #333;
      color: white;
    }
    .nav-links button {
      margin-left: 10px;
      padding: 8px 16px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background: #555;
      color: white;
    }
    .nav-links button.active { background: #28a745; }
    .content { padding: 20px; }
  `]
})
export class AppComponent {
  // Simpele variabele om te switchen tussen schermen zonder complexe routing
  view: 'form' | 'dash' = 'dash';
}
