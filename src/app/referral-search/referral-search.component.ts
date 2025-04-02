import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-referral-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './referral-search.component.html',
  styleUrls: ['./referral-search.component.css'],
})
export class ReferralSearchComponent {
  searchTerm: string = '';
  matchingCompanies: any[] = [];
  matchingPeople: any[] = [];
  showResults: boolean = false;

  newPersonName: string = '';
  newCompanyName: string = '';
  newCareerPage: string = '';

  constructor(private referralService: ReferralService) {}

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.showResults = false;
      this.matchingCompanies = [];
      this.matchingPeople = [];
      return;
    }

    const referrals = this.referralService.getReferrals();

    this.matchingPeople = referrals.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm)
    );

    this.matchingCompanies = [];
    referrals.forEach((person) => {
      person.companies.forEach((company: any) => {
        if (company.name.toLowerCase().includes(this.searchTerm)) {
          const existingCompany = this.matchingCompanies.find(
            (c) => c.name.toLowerCase() === company.name.toLowerCase()
          );
          if (existingCompany) {
            if (!existingCompany.referrals.includes(person.name)) {
              existingCompany.referrals.push(person.name);
            }
          } else {
            this.matchingCompanies.push({
              name: company.name,
              careerPage: company.careerPage,
              referrals: [person.name],
            });
          }
        }
      });
    });

    this.showResults =
      this.matchingCompanies.length > 0 || this.matchingPeople.length > 0;
  }

  addReferral() {
    if (this.newPersonName && this.newCompanyName && this.newCareerPage) {
      this.referralService.addOrUpdateReferral(
        this.newPersonName,
        this.newCompanyName,
        this.newCareerPage
      );
      this.newPersonName = '';
      this.newCompanyName = '';
      this.newCareerPage = '';
      this.onSearch({ target: { value: this.searchTerm } } as any);
    }
  }
}
