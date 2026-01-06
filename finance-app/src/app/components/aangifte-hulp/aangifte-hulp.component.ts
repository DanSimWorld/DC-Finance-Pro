import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Vergeet FormsModule niet voor de jaar-selectie!
import { FinanceService } from '../../services/finance.service';
import { HoursService } from '../../services/hours.service';

@Component({
  selector: 'app-aangifte-hulp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aangifte-hulp.component.html',
  styleUrl: './aangifte-hulp.component.scss',
})
export class AangifteHulpComponent {
  financeService = inject(FinanceService);
  hoursService = inject(HoursService);

  // Switchers
  activeTab = signal<'BTW' | 'IB'>('BTW');
  selectedQuarter = signal<number>(1);

  // Nieuw: Jaar selectie (default op huidig jaar)
  selectedYear = signal<number>(2026);

  // BTW Berekening per kwartaal (gefilterd op selectedYear)
  btwRapport = computed(() => {
    const allTx = this.financeService.transactions();
    const q = this.selectedQuarter();
    const year = Number(this.selectedYear());

    const quarterTx = allTx.filter(t => {
      const d = new Date(t.date);
      const tq = Math.floor(d.getMonth() / 3) + 1;
      return d.getFullYear() === year && tq === q;
    });

    const omzet = quarterTx.filter(t => t.type === 'INCOME');
    const kosten = quarterTx.filter(t => t.type === 'EXPENSE');

    const btwVerkoop = omzet.reduce((acc, t) => acc + t.vatAmount, 0);
    const btwInkoop = kosten.reduce((acc, t) => acc + t.vatAmount, 0);

    return {
      rubriek1a: {
        grondslag: omzet.reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: btwVerkoop
      },
      rubriek5b: {
        voorbelasting: btwInkoop
      },
      totaal: btwVerkoop - btwInkoop
    };
  });

  // Inkomstenbelasting (Jaaroverzicht gefilterd op selectedYear)
  ibRapport = computed(() => {
    const year = Number(this.selectedYear());

    // Filter uren voor dit specifieke jaar
    const urenInJaar = this.hoursService.hourLogs()
      .filter(l => new Date(l.date).getFullYear() === year)
      .reduce((acc, l) => acc + l.duration, 0);

    // Filter transacties voor dit specifieke jaar
    const jaarTx = this.financeService.transactions().filter(t =>
      new Date(t.date).getFullYear() === year
    );

    const omzetJaar = jaarTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amountExclVat, 0);
    const kostenJaar = jaarTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amountExclVat, 0);
    const winst = omzetJaar - kostenJaar;

    // Fiscale regels: Zelfstandigenaftrek daalt (2025: 5030, 2026: 2480)
    const haaltUren = urenInJaar >= 1225;
    const aftrekBedrag = year <= 2025 ? 5030 : 2480;
    const zelfstAftrek = haaltUren ? Math.min(winst, aftrekBedrag) : 0;

    const winstNaAftrek = Math.max(0, winst - zelfstAftrek);
    const mkbVrijstelling = winstNaAftrek * 0.1331;
    const belastbaar = winstNaAftrek - mkbVrijstelling;

    return {
      winst,
      zelfstAftrek,
      mkbVrijstelling,
      belastbaar,
      uren: urenInJaar
    };
  });
}
