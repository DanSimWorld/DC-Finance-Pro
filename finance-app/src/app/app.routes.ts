import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { FiscalSettingsComponent } from './components/fiscal-settings/fiscal-settings.component';
import { HoursTrackerComponent} from './components/hours-tracker/hours-tracker.component';
import { AangifteHulpComponent} from './components/aangifte-hulp/aangifte-hulp.component';


export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add', component: TransactionFormComponent },
  { path: 'fiscal', component: FiscalSettingsComponent },
  { path: 'hours', component: HoursTrackerComponent },
  { path: 'aangifte', component: AangifteHulpComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Standaard route
  { path: '**', redirectTo: 'dashboard' }, // Fallback bij onbekende URL

];
