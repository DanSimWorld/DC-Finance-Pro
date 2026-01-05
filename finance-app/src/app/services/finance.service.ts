import { Injectable, signal, computed } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  // We gebruiken Signals voor automatische UI updates
  transactions = signal<Transaction[]>([]);

  // Automatische berekening van de totale winst (Excl. BTW!)
  totalProfit = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'INCOME' ? acc + t.amountExclVat : acc - t.amountExclVat;
    }, 0);
  });

  // BTW Te betalen of terug te vragen (Inkomende BTW - Uitgaande BTW)
  vatBalance = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'INCOME' ? acc + t.vatAmount : acc - t.vatAmount;
    }, 0);
  });

  // finance.service.ts

  addTransaction(
    amountInput: number,
    vatRate: number,
    type: 'INCOME' | 'EXPENSE',
    desc: string,
    date: Date, // De 5e parameter
    mode: 'INCL' | 'EXCL' = 'INCL' // Optionele 6e voor de uitsplitsing
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
      date: date, // Gebruik de gekozen datum!
      description: desc,
      amountExclVat: Number(excl.toFixed(2)),
      vatPercentage: vatRate as any,
      vatAmount: Number(vat.toFixed(2)),
      amountInclVat: Number(incl.toFixed(2)),
      type: type,
      category: 'Algemeen'
    };

    this.transactions.update(prev => [...prev, newTransaction]);
  }

  deleteTransaction(id: string) {
    this.transactions.update(prev => {
      const newList = prev.filter(t => t.id !== id);
      // Vergeet niet de vernieuwde lijst direct op te slaan in localStorage!
      localStorage.setItem('finance_data', JSON.stringify(newList));
      return newList;
    });
  }
}
