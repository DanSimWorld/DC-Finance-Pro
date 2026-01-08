import { Injectable, signal, computed } from '@angular/core';
import { Transaction, UserSettings } from '../models/transaction.model';


@Injectable({ providedIn: 'root' })
export class FinanceService {
  transactions = signal<Transaction[]>([]);
  settings = signal<UserSettings | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadFromDisk();
  }

  // 1. Winstberekening (Excl. BTW)
  totalProfit = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'INCOME' ? acc + t.amountExclVat : acc - t.amountExclVat;
    }, 0);
  });

  totalVatBalance = computed(() => {
    const list = this.transactions();

    // 1. Wat je moet betalen (Rubriek 1a + Rubriek 4a + Rubriek 4b)
    const verschuldigd = list.reduce((acc, t) => {
      if (t.type === 'INCOME') return acc + t.vatAmount;
      if (t.taxCategory === '4A' || t.taxCategory === '4B') return acc + t.vatAmount;
      return acc;
    }, 0);

    // 2. Wat je mag aftrekken (Alle uitgaven BTW, inclusief verlegde BTW bij 5b)
    const aftrekbaar = list.reduce((acc, t) => {
      if (t.type === 'EXPENSE') return acc + t.vatAmount;
      return acc;
    }, 0);

    // Het resultaat: (Normale BTW verkoop + Verlegde BTW) - (Normale BTW inkoop + Verlegde BTW)
    // De verlegde BTW valt hierdoor weg tegen elkaar (Som - Som = 0)
    return verschuldigd - aftrekbaar;
  });

  // 3. Rubriek 5b: Dit is puur voor het invulveld op de aangifte (Inclusief de verlegde BTW)
  totalVatPreTax = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'EXPENSE' ? acc + t.vatAmount : acc;
    }, 0);
  });

  // 4. Het BTW Rapportage object voor het aangifte-tabelletje
  taxReport = computed(() => {
    const list = this.transactions();
    return {
      rubriek1a: {
        omzet: list.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: list.filter(t => t.taxCategory === '1A').reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek4a: {
        omzet: list.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: list.filter(t => t.taxCategory === '4A').reduce((acc, t) => acc + t.vatAmount, 0)
      },
      rubriek4b: {
        omzet: list.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.amountExclVat, 0),
        btw: list.filter(t => t.taxCategory === '4B').reduce((acc, t) => acc + t.vatAmount, 0)
      }
    };
  });

  // --- DATA OPSLAG (ongewijzigd) ---
  private async saveToDisk() {
    const electron = (window as any).electron;
    if (electron) {
      await electron.saveData('finance_data', this.transactions());
    }
  }

  private async loadFromDisk() {
    const electron = (window as any).electron;
    if (electron) {
      const data = await electron.getData('finance_data');
      const savedSettings = await electron.getData('user_settings'); // Nieuwe sleutel

      if (savedSettings) {
        this.settings.set(savedSettings);
      }

      if (data && Array.isArray(data)) {
        const formattedData = data.map(t => ({
          ...t,
          date: new Date(t.date),
          taxCategory: t.taxCategory || 'NONE'
        }));
        this.transactions.set(formattedData);
      }
    }
  }

// Methode om setup te voltooien
  async setupAccount(companyName: string, pincode: string) {
    const newSettings: UserSettings = { companyName, pincode, isSetup: true };
    this.settings.set(newSettings);
    this.isAuthenticated.set(true);

    const electron = (window as any).electron;
    if (electron) {
      await electron.saveData('user_settings', newSettings);
    }
  }

// Methode om in te loggen
  login(pincode: string): boolean {
    if (this.settings()?.pincode === pincode) {
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }
  // --- ACTIES (ongewijzigd) ---
  addTransaction(
    amountInput: number,
    vatRate: number,
    type: 'INCOME' | 'EXPENSE',
    desc: string,
    date: Date,
    mode: 'INCL' | 'EXCL' = 'INCL',
    taxCategory: '1A' | '1B' | '4A' | '4B' | 'NONE' = 'NONE'
  ) {
    let excl: number, vat: number, incl: number;

    if (taxCategory === '4A' || taxCategory === '4B') {
      excl = amountInput;
      vat = excl * (vatRate / 100);
      incl = excl;
    }
    else if (mode === 'INCL') {
      excl = amountInput / (1 + (vatRate / 100));
      incl = amountInput;
      vat = incl - excl;
    } else {
      excl = amountInput;
      vat = excl * (vatRate / 100);
      incl = excl + vat;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: date,
      description: desc,
      amountExclVat: Number(excl.toFixed(2)),
      vatPercentage: vatRate as 0 | 9 | 21,
      vatAmount: Number(vat.toFixed(2)),
      amountInclVat: Number(incl.toFixed(2)),
      type: type,
      category: 'Algemeen',
      taxCategory: taxCategory
    };

    this.transactions.update(prev => [...prev, newTransaction]);
    this.saveToDisk();
  }

  deleteTransaction(id: string) {
    this.transactions.update(prev => prev.filter(t => t.id !== id));
    this.saveToDisk();
  }
}
