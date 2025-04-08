import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReferralSearchComponent } from './referral-search/referral-search.component';
import { CompaniesComponent } from './companies/companies.component';
import { ReferrersComponent } from './referrers/referrers.component';
import { RecruitingFirmsComponent } from './recruiting-firms/recruiting-firms.component';
import { JobPostingsComponent } from './job-postings/job-postings.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { JobPostingDetailsComponent } from './job-posting-details/job-posting-details.component';
import { CompanyWeeklyCheckComponent } from './company-weekly-check/company-weekly-check.component';
import { RecruitingFirmWeeklyCheckComponent } from './recruiting-firm-weekly-check/recruiting-firm-weekly-check.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'referrals', component: ReferralSearchComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'referrers', component: ReferrersComponent },
  { path: 'recruiting-firms', component: RecruitingFirmsComponent },
  { path: 'job-postings', component: JobPostingsComponent },
  { path: 'job-details/:id', component: JobDetailsComponent },
  { path: 'job-posting-details/:id', component: JobPostingDetailsComponent },
  { path: 'company-weekly-check', component: CompanyWeeklyCheckComponent },
  {
    path: 'recruiting-firm-weekly-check',
    component: RecruitingFirmWeeklyCheckComponent,
  },
  { path: '**', redirectTo: '' },
];
