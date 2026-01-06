import { Component, inject, computed, signal } from '@angular/core'; // Voeg signal toe
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

  // We maken van de filters Signals. Dit dwingt de UI om te updaten.
  searchTerm = signal<string>('');
  selectedMonth = signal<string>('all');

  months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

  // 1. De categorie-overzichten (blijft hetzelfde, maar is nu afhankelijk van de urenService)
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

  // 2. De FILTER FUNCTIE (Nu gekoppeld aan de signals)
  filteredLogs = computed(() => {
    const allLogs = this.hoursService.hourLogs();
    const search = this.searchTerm().toLowerCase().trim();
    const month = this.selectedMonth();

    let filtered = [...allLogs];

    // Filter op tekst
    if (search) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(search) ||
        log.category.toLowerCase().includes(search)
      );
    }

    // Filter op maand
    if (month !== 'all') {
      filtered = filtered.filter(log => log.date.getMonth() === Number(month));
    }

    // Altijd de nieuwste bovenaan
    return filtered.reverse();
  });

  // Event handlers voor de UI om de signals te updaten
  updateSearch(value: string) {
    this.searchTerm.set(value);
  }

  updateMonth(value: string) {
    this.selectedMonth.set(value);
  }

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
    if(confirm('Uren verwijderen?')) {
      this.hoursService.deleteLog(id);
    }
  }
}
