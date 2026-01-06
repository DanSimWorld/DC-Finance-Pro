import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoursService } from '../../services/hours.service';

@Component({
  selector: 'app-hours-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hours-tracker.component.html',
  styleUrl: './hours-tracker.component.scss'
})
export class HoursTrackerComponent {
  hoursService = inject(HoursService);

  // Filters als losse velden (gebonden via ngModel)
  searchTerm = '';
  selectedMonth: string | number = 'all';
  months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

  // 1. De mooie categorie-overzichten
  hoursByCategory = computed(() => {
    const logs = this.hoursService.hourLogs();
    return {
      KLANT: logs.filter(l => l.category === 'KLANT').reduce((a, b) => a + b.duration, 0),
      ADMIN: logs.filter(l => l.category === 'ADMIN').reduce((a, b) => a + b.duration, 0),
      MARKETING: logs.filter(l => l.category === 'MARKETING').reduce((a, b) => a + b.duration, 0),
      STUDIE: logs.filter(l => l.category === 'STUDIE').reduce((a, b) => a + b.duration, 0),
      OVERIG: logs.filter(l => l.category === 'OVERIG').reduce((a, b) => a + b.duration, 0)
    };
  });

  // 2. De werkende zoek- en filterfunctie
  filteredLogs = computed(() => {
    let logs = [...this.hoursService.hourLogs()].reverse();

    // Filter op zoekterm
    if (this.searchTerm.trim()) {
      logs = logs.filter(l =>
        l.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter op maand
    if (this.selectedMonth !== 'all') {
      logs = logs.filter(l => l.date.getMonth() === Number(this.selectedMonth));
    }

    return logs;
  });

  onAddHours(event: any) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    this.hoursService.addHours(
      Number(formData.get('duration')),
      formData.get('description') as string,
      formData.get('category') as any,
      new Date(formData.get('date') as string)
    );
    form.reset();
  }

  onDelete(id: string) {
    if(confirm('Uren verwijderen?')) this.hoursService.deleteLog(id);
  }
}
