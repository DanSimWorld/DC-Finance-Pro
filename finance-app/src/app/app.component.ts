import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importeer RouterModule voor navigatie

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Alleen RouterModule is nu nodig
  template: `
    <div class="main-layout">
      <nav class="top-nav">
        <h1>DC Finance Pro</h1>
        <div class="nav-links">
          <button routerLink="/add" routerLinkActive="active">➕ Toevoegen</button>
          <button routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</button>
          <button routerLink="/fiscal" routerLinkActive="active">⚖️ Fiscaal Advies</button>
          <button routerLink="/hours" routerLinkActive="active">⏱️ Uren</button>
          <button routerLink="/aangifte" routerLinkActive="active">📋 Aangiftehulp</button>
          <button routerLink="/exports" routerLinkActive="active">📤 Exports</button>
        </div>
      </nav>

      <main class="content">
        <router-outlet></router-outlet>
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
      text-decoration: none;
    }
    /* routerLinkActive zorgt dat de knop van de actieve pagina groen wordt */
    .active { background: #28a745 !important; }
    .content { padding: 20px; }
  `]
})
export class AppComponent {}
