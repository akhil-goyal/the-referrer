import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-referrers',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './referrers.component.html',
  styleUrls: ['./referrers.component.css'],
})
export class ReferrersComponent implements OnInit {
  referrers$!: Observable<any[]>;
  selectedReferrer: any = null;
  successMessage: string = '';
  errorMessage: string = '';

  // For adding a new company in the edit modal
  newCompanyName: string = '';
  newCareerPage: string = '';

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.loadReferrers();
  }

  loadReferrers() {
    this.referrers$ = this.referralService.getReferrals();
  }

  openEditModal(referrer: any) {
    // Create a deep copy to avoid modifying the original data directly
    this.selectedReferrer = {
      ...referrer,
      companies: [...referrer.companies],
    };
  }

  closeModal() {
    this.selectedReferrer = null;
    this.newCompanyName = '';
    this.newCareerPage = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  addCompany() {
    if (this.newCompanyName && this.newCareerPage) {
      const existingCompany = this.selectedReferrer.companies.find(
        (c: any) =>
          c.name.toLowerCase() === this.newCompanyName.toLowerCase() ||
          c.careerPage.toLowerCase() === this.newCareerPage.toLowerCase()
      );
      if (!existingCompany) {
        this.selectedReferrer.companies.push({
          name: this.newCompanyName,
          careerPage: this.newCareerPage,
        });
        this.newCompanyName = '';
        this.newCareerPage = '';
      } else {
        this.errorMessage =
          'This company is already associated with the referrer.';
      }
    }
  }

  removeCompany(index: number) {
    this.selectedReferrer.companies.splice(index, 1);
  }

  saveChanges() {
    if (
      this.selectedReferrer.name &&
      this.selectedReferrer.companies.length > 0
    ) {
      this.referralService
        .updateReferrer(this.selectedReferrer.name, this.selectedReferrer)
        .then(() => {
          this.successMessage = 'Referrer updated successfully!';
          this.loadReferrers();
          setTimeout(() => this.closeModal(), 2000);
        })
        .catch((err) => {
          console.error('Error updating referrer:', err);
          this.errorMessage = 'Error updating referrer. Please try again.';
        });
    } else {
      this.errorMessage =
        'Referrer name and at least one company are required.';
    }
  }

  deleteReferrer(referrerName: string) {
    if (confirm(`Are you sure you want to delete ${referrerName}?`)) {
      this.referralService
        .deleteReferrer(referrerName)
        .then(() => {
          this.loadReferrers();
        })
        .catch((err) => {
          console.error('Error deleting referrer:', err);
          this.errorMessage = 'Error deleting referrer. Please try again.';
        });
    }
  }
}
