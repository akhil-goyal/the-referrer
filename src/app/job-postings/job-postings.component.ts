import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReferralService } from '../referral.service';
import { RouterModule } from '@angular/router';
import { JobPosting } from '../types/referrer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-postings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-postings.component.html',
  styleUrls: ['./job-postings.component.css'],
})
export class JobPostingsComponent implements OnInit {
  jobPostings$!: Observable<JobPosting[]>;
  filteredJobPostings$!: Observable<JobPosting[]>;
  totalPostings: number = 0; // Add totalPostings to track unfiltered count
  searchQuery: string = '';
  locationFilter: string = '';
  companyFilter: string = '';
  sortBy: string = 'timestamp';
  sortOrder: 'asc' | 'desc' = 'desc';
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizes: number[] = [5, 10, 20, 50];
  totalItems: number = 0;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.jobPostings$ = this.referralService.getJobPostings();
    this.jobPostings$.subscribe((postings) => {
      this.totalPostings = postings.length; // Set totalPostings
    });
    this.applyFiltersAndSorting();
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  onLocationFilter() {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  onCompanyFilter() {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  onSortChange() {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFiltersAndSorting();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFiltersAndSorting();
  }

  applyFiltersAndSorting() {
    this.filteredJobPostings$ = this.jobPostings$.pipe(
      map((postings) => {
        // Apply search filter
        let filtered = postings.filter((posting) =>
          this.searchQuery
            ? posting.title
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              posting.companyName
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              posting.location
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              (posting.description &&
                posting.description
                  .toLowerCase()
                  .includes(this.searchQuery.toLowerCase()))
            : true
        );

        // Apply location filter
        filtered = filtered.filter((posting) =>
          this.locationFilter
            ? posting.location &&
              posting.location
                .toLowerCase()
                .includes(this.locationFilter.toLowerCase())
            : true
        );

        // Apply company filter
        filtered = filtered.filter((posting) =>
          this.companyFilter
            ? posting.companyName &&
              posting.companyName.toLowerCase() ===
                this.companyFilter.toLowerCase()
            : true
        );

        // Update total items for pagination
        this.totalItems = filtered.length;

        // Apply sorting
        filtered.sort((a, b) => {
          const multiplier = this.sortOrder === 'asc' ? 1 : -1;
          if (this.sortBy === 'title') {
            return multiplier * a.title.localeCompare(b.title);
          } else if (this.sortBy === 'timestamp') {
            return multiplier * (a.timestamp - b.timestamp);
          }
          return 0;
        });

        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return filtered.slice(startIndex, endIndex);
      })
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  async deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job posting?')) {
      await this.referralService.deleteJobPosting(jobId);
      this.jobPostings$ = this.referralService.getJobPostings();
      this.jobPostings$.subscribe((postings) => {
        this.totalPostings = postings.length; // Update totalPostings after deletion
      });
      this.applyFiltersAndSorting();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
