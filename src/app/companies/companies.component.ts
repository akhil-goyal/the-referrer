import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-companies',
  imports: [RouterModule, CommonModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
})
export class CompaniesComponent implements OnInit {
  companies$!: Observable<{ name: string; careerPage: string }[]>;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.companies$ = this.referralService.getReferrals().pipe(
      map((referrals) => {
        const companySet = new Set<string>();
        const uniqueCompanies: { name: string; careerPage: string }[] = [];

        referrals.forEach((person: any) => {
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

        return uniqueCompanies.sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }
}
