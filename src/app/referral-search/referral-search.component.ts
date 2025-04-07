import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-referral-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './referral-search.component.html',
  styleUrls: ['./referral-search.component.css'],
})
export class ReferralSearchComponent implements OnInit {
  searchTerm: string = '';
  matchingCompanies: any[] = [];
  matchingPeople: any[] = [];
  showResults: boolean = false;

  newPersonName: string = '';
  newCompanyName: string = '';
  newCareerPage: string = '';

  referrals$!: Observable<any[]>;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.referrals$ = this.referralService.getReferrals();
    this.referrals$.subscribe((referrals) => {
      this.onSearch({ target: { value: this.searchTerm } } as any);
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase().trim();

    if (!this.searchTerm) {
      this.showResults = false;
      this.matchingCompanies = [];
      this.matchingPeople = [];
      return;
    }

    this.referrals$.subscribe((referrals) => {
      this.matchingPeople = referrals.filter((p: any) =>
        p.name.toLowerCase().includes(this.searchTerm)
      );

      this.matchingCompanies = [];
      referrals.forEach((person: any) => {
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
    });
  }

  addReferral() {
    if (this.newPersonName && this.newCompanyName && this.newCareerPage) {
      this.referralService
        .addOrUpdateReferral(
          this.newPersonName,
          this.newCompanyName,
          this.newCareerPage
        )
        .then(() => {
          this.newPersonName = '';
          this.newCompanyName = '';
          this.newCareerPage = '';
          this.onSearch({ target: { value: this.searchTerm } } as any);
        })
        .catch((err) => console.error('Error adding referral:', err));
    }
  }
}
