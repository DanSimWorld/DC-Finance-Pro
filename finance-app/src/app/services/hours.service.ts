import { Injectable, signal, effect, computed } from '@angular/core';
import { HourLog } from '../models/hour-log.model';

@Injectable({ providedIn: 'root' })
export class HoursService {
  hourLogs = signal<HourLog[]>([]);
  readonly TARGET_HOURS = 1225;

  constructor() {
    const saved = localStorage.getItem('hour_logs');
    if (saved) {
      this.hourLogs.set(JSON.parse(saved).map((l: any) => ({ ...l, date: new Date(l.date) })));
    }

    effect(() => {
      localStorage.setItem('hour_logs', JSON.stringify(this.hourLogs()));
    });
  }

  addHours(duration: number, description: string, category: any, date: Date) {
    const newLog: HourLog = {
      id: crypto.randomUUID(),
      date,
      description,
      category,
      duration
    };
    this.hourLogs.update(prev => [...prev, newLog]);
  }

  deleteLog(id: string) {
    this.hourLogs.update(prev => prev.filter(l => l.id !== id));
  }

  totalHours = computed(() => {
    return this.hourLogs().reduce((acc, l) => acc + l.duration, 0);
  });

  progressPercentage = computed(() => {
    return Math.min(100, (this.totalHours() / this.TARGET_HOURS) * 100);
  });
}
