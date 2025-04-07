import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReferralSearchComponent } from './referral-search/referral-search.component';
import { CompaniesComponent } from './companies/companies.component';
import { ReferrersComponent } from './referrers/referrers.component';
import { RecruitingFirmsComponent } from './recruiting-firms/recruiting-firms.component';
import { JobPostingsComponent } from './job-postings/job-postings.component';
import { JobDetailsComponent } from './job-details/job-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'referrals', component: ReferralSearchComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'referrers', component: ReferrersComponent },
  { path: 'recruiting-firms', component: RecruitingFirmsComponent },
  { path: 'job-postings', component: JobPostingsComponent },
  { path: 'job-details/:id', component: JobDetailsComponent },
  { path: '**', redirectTo: '' },
];
