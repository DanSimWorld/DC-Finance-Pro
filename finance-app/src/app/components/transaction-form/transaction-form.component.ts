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
    this.transactionForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      description: ['', Validators.required],
      type: ['EXPENSE', Validators.required],
      inputMode: ['INCL'],
      amountInput: [0, [Validators.required, Validators.min(0.01)]],
      vatPercentage: [21, Validators.required],
      taxCategory: ['NONE'],
      amountExclVat: [{ value: 0, disabled: true }],
      vatAmount: [{ value: 0, disabled: true }],
      amountInclVat: [{ value: 0, disabled: true }]
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(newType => {
      if (newType === 'INCOME') {
        this.transactionForm.patchValue({ taxCategory: '1A' }, { emitEvent: false });
      } else {
        this.transactionForm.patchValue({ taxCategory: 'NONE' }, { emitEvent: false });
      }
    });

    this.transactionForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  calculateTotals() {
    const inputAmount = this.transactionForm.get('amountInput')?.value || 0;
    const percentage = this.transactionForm.get('vatPercentage')?.value || 0;
    const mode = this.transactionForm.get('inputMode')?.value;
    const taxCat = this.transactionForm.get('taxCategory')?.value; // NIEUW

    let excl, vat, incl;

    if (taxCat === '4A' || taxCat === '4B') {
      // Verlegde BTW logica voor preview
      excl = inputAmount;
      vat = excl * (percentage / 100);
      incl = excl; // Je betaalt de BTW niet aan de leverancier
    } else if (mode === 'INCL') {
      excl = inputAmount / (1 + (percentage / 100));
      incl = inputAmount;
      vat = incl - excl;
    } else {
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
        rawData.amountInput,
        rawData.vatPercentage,
        rawData.type,
        rawData.description,
        new Date(rawData.date),
        rawData.inputMode,
        rawData.taxCategory // NIEUW: Wordt nu doorgegeven aan de service
      );
      // Reset met default NONE voor taxCategory
      this.transactionForm.reset({
        date: new Date().toISOString().substring(0, 10),
        type: 'EXPENSE',
        vatPercentage: 21,
        taxCategory: 'NONE',
        amountInput: 0
      });
    }
  }
}
