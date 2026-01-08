import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  financeService = inject(FinanceService);

  // Filters
  selectedYear = signal<number>(new Date().getFullYear());
  selectedQuarter = signal<number>(Math.floor((new Date().getMonth() + 3) / 3));

  // 1. Filter de transacties op basis van de geselecteerde periode
  filteredTransactions = computed(() => {
    return this.financeService.transactions().filter(t => {
      const transactionDate = new Date(t.date);
      const month = transactionDate.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      return transactionDate.getFullYear() === this.selectedYear() && quarter === this.selectedQuarter();
    });
  });

  // 2. Bereken de cijfers voor de belastingdienst en de winst
  stats = computed(() => {
    const txs = this.filteredTransactions();

    const omzetExcl = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amountExclVat, 0);
    const kostenExcl = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amountExclVat, 0);

    // BTW berekening aangepast voor verlegde BTW
    const btwVerschuldigd = txs.reduce((acc, t) => {
      // Normale inkomsten BTW + Verlegde BTW (4a/4b) die je nog moet aangeven
      if (t.type === 'INCOME') return acc + t.vatAmount;
      if (t.taxCategory === '4A' || t.taxCategory === '4B') return acc + t.vatAmount;
      return acc;
    }, 0);

    const btwAftrekbaar = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.vatAmount, 0);

    const winst = omzetExcl - kostenExcl;
    // Hier vallen 4a/4b nu tegen elkaar weg (Verschuldigd - Aftrekbaar = 0)
    const teBetalenBtw = btwVerschuldigd - btwAftrekbaar;

    const reserveringIB = winst > 0 ? winst * 0.30 : 0;

    // Rapportage data voor de tabel in HTML
    const taxReport = {
      rubriek1a: {
        omzet: txs.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: txs.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek4a: {
        omzet: txs.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: txs.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek4b: {
        omzet: txs.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: txs.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek5b: btwAftrekbaar
    };

    return {
      omzetExcl,
      kostenExcl,
      winst,
      teBetalenBtw,
      reserveringIB,
      besteedbaar: winst - reserveringIB,
      taxReport // Geef dit door aan de HTML
    };
  });
  // In dashboard.component.ts

  onDelete(id: string) {
    if (confirm('Weet je zeker dat je deze transactie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      this.financeService.deleteTransaction(id);
    }
  }
}
