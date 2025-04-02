import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReferralSearchComponent } from './referral-search/referral-search.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'referrals', component: ReferralSearchComponent },
  { path: '**', redirectTo: '' },
];
