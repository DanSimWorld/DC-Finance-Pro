export interface HourLog {
  id: string;
  date: Date;
  description: string;
  category: 'KLANT' | 'ADMIN' | 'MARKETING' | 'STUDIE' | 'OVERIG';
  duration: number; // in uren, bijv. 1.5
}
