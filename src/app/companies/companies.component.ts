import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferralService } from '../referral.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Referrer, Company } from './../../types/referrer';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
})
export class CompaniesComponent implements OnInit {
  companies$!: Observable<Company[]>;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.companies$ = this.referralService.getReferrals().pipe(
      map(referrers => {
        // Flatten the companies arrays from all referrers
        const allCompanies = referrers.reduce((acc, referrer) => {
          if (referrer.companies && Array.isArray(referrer.companies)) {
            return acc.concat(referrer.companies);
          }
          return acc;
        }, [] as Company[]);

        // Remove duplicates based on company name (case-insensitive)
        const uniqueCompaniesMap = new Map<string, Company>();
        allCompanies.forEach(company => {
          const key = company.name.toLowerCase();
          if (!uniqueCompaniesMap.has(key)) {
            uniqueCompaniesMap.set(key, company);
          }
        });

        // Convert map values to array and sort by name
        return Array.from(uniqueCompaniesMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name) // Changed title to name
        );
      })
    );
  }
}