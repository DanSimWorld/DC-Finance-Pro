import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss'
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(FinanceService);

  transactionForm!: FormGroup;

  ngOnInit() {
// In ngOnInit()
    this.transactionForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required], // Standaard op vandaag (YYYY-MM-DD)
      description: ['', Validators.required],
      type: ['EXPENSE', Validators.required],
      inputMode: ['INCL'],
      amountInput: [0, [Validators.required, Validators.min(0.01)]],
      vatPercentage: [21, Validators.required],
      amountExclVat: [{ value: 0, disabled: true }],
      vatAmount: [{ value: 0, disabled: true }],
      amountInclVat: [{ value: 0, disabled: true }]
    });

    // Luister naar veranderingen voor automatische berekening
    this.transactionForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  calculateTotals() {
    const inputAmount = this.transactionForm.get('amountInput')?.value || 0;
    const percentage = this.transactionForm.get('vatPercentage')?.value || 0;
    const mode = this.transactionForm.get('inputMode')?.value;

    let excl, vat, incl;

    if (mode === 'INCL') {
      // Terugrekenen van Incl naar Excl
      // Formule: Incl / (1 + (percentage/100))
      excl = inputAmount / (1 + (percentage / 100));
      incl = inputAmount;
      vat = incl - excl;
    } else {
      // Omhoog rekenen van Excl naar Incl
      excl = inputAmount;
      vat = excl * (percentage / 100);
      incl = excl + vat;
    }

    this.transactionForm.patchValue({
      amountExclVat: excl.toFixed(2),
      vatAmount: vat.toFixed(2),
      amountInclVat: incl.toFixed(2)
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const rawData = this.transactionForm.getRawValue();
      this.financeService.addTransaction(
        rawData.amountInput, // we gebruiken nu de mode-logica in de service of form
        rawData.vatPercentage,
        rawData.type,
        rawData.description,
        new Date(rawData.date) // De gekozen datum omzetten naar een Date object
      );
      this.transactionForm.reset({ type: 'EXPENSE', vatPercentage: 21 });
    }
  }
}
