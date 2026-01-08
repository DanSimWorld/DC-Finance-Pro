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

    const kosten = quarterTx.filter(t => t.type === 'EXPENSE');

    // Rubriek 1a (Verkoop binnenland) - AFRONDEN NAAR BENEDEN
    const r1a_omzet = quarterTx.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.amountExclVat, 0);
    const r1a_btw_raw = quarterTx.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.vatAmount, 0);
    const r1a_btw = Math.floor(r1a_btw_raw); // Hele euro's omlaag

    // Rubriek 4a (Verlegd Buiten EU) - AFRONDEN NAAR BENEDEN
    const r4a_omzet = quarterTx.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.amountExclVat, 0);
    const r4a_btw_raw = quarterTx.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.vatAmount, 0);
    const r4a_btw = Math.floor(r4a_btw_raw);

    // Rubriek 4b (Verlegd Binnen EU) - AFRONDEN NAAR BENEDEN
    const r4b_omzet = quarterTx.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.amountExclVat, 0);
    const r4b_btw_raw = quarterTx.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.vatAmount, 0);
    const r4b_btw = Math.floor(r4b_btw_raw);

    // Rubriek 5b (Voorbelasting) - AFRONDEN NAAR BOVEN
    const voorbelasting_raw = kosten.reduce((acc, t) => acc + t.vatAmount, 0);
    const voorbelasting = Math.ceil(voorbelasting_raw); // Hele euro's omhoog

    // Totaalberekening op basis van de afgeronde getallen
    const totaalVerschuldigd = r1a_btw + r4a_btw + r4b_btw;
    const eindTotaal = totaalVerschuldigd - voorbelasting;

    return {
      rubriek1a: { grondslag: Math.floor(r1a_omzet), btw: r1a_btw },
      rubriek4a: { grondslag: Math.floor(r4a_omzet), btw: r4a_btw },
      rubriek4b: { grondslag: Math.floor(r4b_omzet), btw: r4b_btw },
      rubriek5b: { voorbelasting: voorbelasting },
      totaal: eindTotaal
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
