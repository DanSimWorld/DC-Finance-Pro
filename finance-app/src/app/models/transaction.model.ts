

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amountExclVat: number;
  vatPercentage: 0 | 9 | 21;
  vatAmount: number;
  amountInclVat: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  // Nieuw: Voor de belastingdienst rubrieken
  taxCategory?: '1A' | '1B' | '4A' | '4B' | 'NONE';
}

export interface UserSettings {
  companyName: string;
  pincode: string;
  isSetup: boolean;
}
