export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amountExclVat: number; // Bedrag zonder BTW
  vatPercentage: 0 | 9 | 21; // De standaard NL tarieven
  vatAmount: number;     // Het berekende BTW bedrag
  amountInclVat: number; // Totaalbedrag (incl. BTW)
  type: 'INCOME' | 'EXPENSE';
  category: string;      // Bijv. 'Huur', 'Inkoop', 'Verkoop'
}
