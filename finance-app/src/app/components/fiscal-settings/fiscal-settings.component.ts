import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-fiscal-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiscal-settings.component.html',
  styleUrl: './fiscal-settings.component.scss'
})
export class FiscalSettingsComponent {
  financeService = inject(FinanceService);

  // Gebruikerskeuzes
  isStarter = signal<boolean>(true);
  haaltUrencriterium = signal<boolean>(false);
  gewerkteUren = signal<number>(0);

  // Fiscale bedragen 2025/2026 (ter indicatie)
  ZELFSTANDIGENAFTREK = 2480;
  STARTERSAFTREK = 2123;

  fiscalCalculation = computed(() => {
    const winst = this.financeService.totalProfit();
    let aftrekposten = 0;

    // 1. Ondernemersaftrek (alleen bij urencriterium)
    if (this.haaltUrencriterium()) {
      aftrekposten += this.ZELFSTANDIGENAFTREK;
      if (this.isStarter()) aftrekposten += this.STARTERSAFTREK;
    }

    // 2. Winst na aftrekposten
    const winstNaAftrek = Math.max(0, winst - aftrekposten);

    // 3. MKB-winstvrijstelling (13,31% van de restwinst)
    const mkbVrijstelling = winstNaAftrek * 0.1331;

    // 4. Belastbare winst
    const belastbareWinst = winstNaAftrek - mkbVrijstelling;

    return {
      aftrekposten,
      mkbVrijstelling,
      belastbareWinst,
      belastingSchatting: belastbareWinst * 0.3697 // Schijf 1 tarief
    };
  });
}
