import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // We gebruiken de 'window.electron' bridge die we in Electron gaan definiëren
  private electron = (window as any).electron;

  async saveData(key: string, data: any) {
    if (this.electron) {
      return await this.electron.saveFile(key, data);
    }
    // Fallback voor tijdens development in de browser
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getData(key: string) {
    if (this.electron) {
      return await this.electron.readFile(key);
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
