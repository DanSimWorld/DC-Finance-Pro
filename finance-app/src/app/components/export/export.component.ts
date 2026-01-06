import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';
import { HoursService } from '../../services/hours.service';

// PDF Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe, DecimalPipe], // Nodig voor formattering in de PDF
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss'
})
export class ExportComponent {
  financeService = inject(FinanceService);
  hoursService = inject(HoursService);
  datePipe = inject(DatePipe);
  decimalPipe = inject(DecimalPipe);

  today = new Date();
  selectedType = signal<'UREN' | 'FINANCIEEL'>('UREN');
  selectedYear = signal<number>(2026);
  selectedMonth = signal<number>(0);

  months = [
    { id: 0, name: 'Heel Jaar' },
    { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maart' },
    { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' }, { id: 8, name: 'Augustus' }, { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
  ];

  filteredHours = computed(() => {
    const year = Number(this.selectedYear());
    const month = Number(this.selectedMonth());
    return this.hoursService.hourLogs().filter(log => {
      const d = new Date(log.date);
      return d.getFullYear() === year && (month === 0 || (d.getMonth() + 1) === month);
    });
  });

  filteredFinance = computed(() => {
    const year = Number(this.selectedYear());
    const month = Number(this.selectedMonth());
    return this.financeService.transactions().filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && (month === 0 || (d.getMonth() + 1) === month);
    });
  });

  generatePDF() {
    const doc = new jsPDF();
    const isUren = this.selectedType() === 'UREN';
    const year = this.selectedYear();
    const monthName = this.months.find(m => m.id === Number(this.selectedMonth()))?.name;

    // --- PDF Header ---
    doc.setFontSize(18);
    doc.setTextColor(0, 68, 148); // Blauwe NK Wellbeing kleur
    doc.text('NK Wellbeing - Administratie Overzicht', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Periode: ${monthName} ${year}`, 14, 30);
    doc.text(`Geëxporteerd op: ${this.datePipe.transform(this.today, 'dd-MM-yyyy HH:mm')}`, 14, 35);
    doc.text(`Type: ${isUren ? 'Urenverantwoording' : 'Financieel overzicht'}`, 14, 40);

    // --- Tabel Data Opbouwen ---
    if (isUren) {
      const head = [['Datum', 'Omschrijving', 'Uren']];
      const body = this.filteredHours().map(item => [
        this.datePipe.transform(item.date, 'dd-MM-yyyy') || '',
        item.description,
        `${item.duration} u`
      ]);

      autoTable(doc, {
        startY: 50,
        head: head,
        body: body,
        headStyles: { fillColor: [0, 68, 148] },
        theme: 'striped'
      });
    } else {
      const head = [['Datum', 'Type', 'Omschrijving', 'Excl. BTW', 'BTW Bedrag']];
      const body = this.filteredFinance().map(item => [
        this.datePipe.transform(item.date, 'dd-MM-yyyy') || '',
        item.type === 'INCOME' ? 'Inkomst' : 'Uitgave',
        item.description,
        `€ ${this.decimalPipe.transform(item.amountExclVat, '1.2-2')}`,
        `€ ${this.decimalPipe.transform(item.vatAmount, '1.2-2')}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: head,
        body: body,
        headStyles: { fillColor: [0, 68, 148] },
        theme: 'striped'
      });
    }

    // --- Downloaden ---
    const filename = `NK_Wellbeing_${isUren ? 'Uren' : 'Financieel'}_${monthName}_${year}.pdf`;
    doc.save(filename);
  }
}
