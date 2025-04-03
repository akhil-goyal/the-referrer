import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReferralSearchComponent } from './referral-search/referral-search.component';
import { CompaniesComponent } from './companies/companies.component';
import { ReferrersComponent } from './referrers/referrers.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'referrals', component: ReferralSearchComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'referrers', component: ReferrersComponent },
  { path: '**', redirectTo: '' },
];
