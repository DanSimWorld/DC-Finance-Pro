import { Injectable, signal, computed } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  transactions = signal<Transaction[]>([]);

  constructor() {
    // Zodra de service wordt geladen, halen we de data op uit het bestand
    this.loadFromDisk();
  }

  totalProfit = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'INCOME' ? acc + t.amountExclVat : acc - t.amountExclVat;
    }, 0);
  });

  vatBalance = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'INCOME' ? acc + t.vatAmount : acc - t.vatAmount;
    }, 0);
  });

  // Hulpfunctie om data veilig naar de harde schijf te schrijven
  private async saveToDisk() {
    const electron = (window as any).electron;
    if (electron) {
      await electron.saveData('finance_data', this.transactions());
    }
  }

  // Hulpfunctie om data te laden bij opstarten
  private async loadFromDisk() {
    const electron = (window as any).electron;
    if (electron) {
      const data = await electron.getData('finance_data');
      if (data && Array.isArray(data)) {
        // BELANGRIJK: JSON maakt van een Date een string.
        // We moeten er weer echte Date objecten van maken voor de kalender/filters.
        const formattedData = data.map(t => ({
          ...t,
          date: new Date(t.date)
        }));
        this.transactions.set(formattedData);
      }
    }
  }

  addTransaction(
    amountInput: number,
    vatRate: number,
    type: 'INCOME' | 'EXPENSE',
    desc: string,
    date: Date,
    mode: 'INCL' | 'EXCL' = 'INCL'
  ) {
    let excl: number;
    let vat: number;
    let incl: number;

    if (mode === 'INCL') {
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
      vatPercentage: vatRate as any,
      vatAmount: Number(vat.toFixed(2)),
      amountInclVat: Number(incl.toFixed(2)),
      type: type,
      category: 'Algemeen'
    };

    this.transactions.update(prev => [...prev, newTransaction]);

    // Direct opslaan naar het JSON bestand
    this.saveToDisk();
  }

  deleteTransaction(id: string) {
    this.transactions.update(prev => {
      const newList = prev.filter(t => t.id !== id);
      return newList;
    });

    // Direct de nieuwe lijst opslaan en localStorage negeren
    this.saveToDisk();
  }
}
