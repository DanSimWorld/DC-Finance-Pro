import { Injectable, signal, computed } from '@angular/core';
import { HourLog } from '../models/hour-log.model';

@Injectable({ providedIn: 'root' })
export class HoursService {
  hourLogs = signal<HourLog[]>([]);
  readonly TARGET_HOURS = 1225;

  constructor() {
    // Start direct met laden van de harde schijf
    this.loadFromDisk();
  }

  // --- Electron Opslag Logica ---

  private async loadFromDisk() {
    const electron = (window as any).electron;
    if (electron) {
      const saved = await electron.getData('hour_logs');
      if (saved && Array.isArray(saved)) {
        this.hourLogs.set(
          saved.map((l: any) => ({ ...l, date: new Date(l.date) }))
        );
      }
    }
  }

  private async saveToDisk() {
    const electron = (window as any).electron;
    if (electron) {
      await electron.saveData('hour_logs', this.hourLogs());
    }
  }

  // --- Acties ---

  addHours(duration: number, description: string, category: any, date: Date) {
    const newLog: HourLog = {
      id: crypto.randomUUID(),
      date,
      description,
      category,
      duration
    };
    this.hourLogs.update(prev => [...prev, newLog]);

    // Sla direct op naar de harde schijf
    this.saveToDisk();
  }

  deleteLog(id: string) {
    this.hourLogs.update(prev => prev.filter(l => l.id !== id));

    // Sla de wijziging op
    this.saveToDisk();
  }

  // --- Computed Waarden ---

  totalHours = computed(() => {
    return this.hourLogs().reduce((acc, l) => acc + l.duration, 0);
  });

  progressPercentage = computed(() => {
    const total = this.totalHours();
    return Math.min(100, (total / this.TARGET_HOURS) * 100);
  });
}
