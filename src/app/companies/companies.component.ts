import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-companies',
  imports: [RouterModule, CommonModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
})
export class CompaniesComponent {
  companies: { name: string; careerPage: string }[] = [];

  constructor(private referralService: ReferralService) {
    this.loadCompanies();
  }

  private loadCompanies() {
    const referrals = this.referralService.getReferrals();
    const companySet = new Set<string>();
    const uniqueCompanies: { name: string; careerPage: string }[] = [];

    // Iterate through all referrals to collect unique companies
    referrals.forEach((person) => {
      person.companies.forEach(
        (company: { name: string; careerPage: string }) => {
          const companyKey = `${company.name.toLowerCase()}|${company.careerPage.toLowerCase()}`;
          if (!companySet.has(companyKey)) {
            companySet.add(companyKey);
            uniqueCompanies.push({
              name: company.name,
              careerPage: company.careerPage,
            });
          }
        }
      );
    });

    this.companies = uniqueCompanies.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}
