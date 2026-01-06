import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';
import { HoursService } from '../../services/hours.service';

@Component({
  selector: 'app-aangifte-hulp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aangifte-hulp.component.html',
  styleUrl: './aangifte-hulp.component.scss'
})
export class AangifteHulpComponent {
  financeService = inject(FinanceService);
  hoursService = inject(HoursService);

  // Switchers
  activeTab = signal<'BTW' | 'IB'>('BTW');
  selectedQuarter = signal<number>(1);
  currentYear = 2026;

  // BTW Berekening per kwartaal
  btwRapport = computed(() => {
    const allTx = this.financeService.transactions();
    const q = this.selectedQuarter();

    const quarterTx = allTx.filter(t => {
      const d = new Date(t.date);
      const tq = Math.floor(d.getMonth() / 3) + 1;
      return d.getFullYear() === this.currentYear && tq === q;
    });

    const omzet = quarterTx.filter(t => t.type === 'INCOME');
    const kosten = quarterTx.filter(t => t.type === 'EXPENSE');

    return {
      rubriek1a: {
        grondslag: omzet.reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: omzet.reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek5b: {
        voorbelasting: kosten.reduce((acc, t) => acc + t.vatAmount, 0)
      },
      totaal: omzet.reduce((acc, t) => acc + t.vatAmount, 0) - kosten.reduce((acc, t) => acc + t.vatAmount, 0)
    };
  });

  // Inkomstenbelasting (Jaaroverzicht)
  ibRapport = computed(() => {
    const winst = this.financeService.totalProfit(); // Gebruikt alle gelogde transacties
    const haaltUren = this.hoursService.totalHours() >= 1225;

    const zelfstAftrek = haaltUren ? 2480 : 0;
    const winstNaAftrek = Math.max(0, winst - zelfstAftrek);
    const mkbVrijstelling = winstNaAftrek * 0.1331;
    const belastbaar = winstNaAftrek - mkbVrijstelling;

    return {
      winst,
      zelfstAftrek,
      mkbVrijstelling,
      belastbaar,
      uren: this.hoursService.totalHours()
    };
  });
}
