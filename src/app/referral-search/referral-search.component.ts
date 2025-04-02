import { Component } from '@angular/core';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-referral-search',
  imports: [CommonModule],
  templateUrl: './referral-search.component.html',
  styleUrls: ['./referral-search.component.css'],
})
export class ReferralSearchComponent {
  searchTerm: string = '';
  matchingCompanies: any[] = [];
  matchingPeople: any[] = [];
  showResults: boolean = false;

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

    // Search for people
    this.matchingPeople = referrals.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm)
    );

    // Search for companies
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
}
