import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ReferralService } from '../referral.service';
import { RouterModule } from '@angular/router';
import { JobPosting } from './../../types/referrer';

@Component({
  selector: 'app-job-postings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-postings.component.html',
  styleUrls: ['./job-postings.component.css'],
})
export class JobPostingsComponent implements OnInit {
  jobPostings$!: Observable<JobPosting[]>; // Use non-null assertion operator

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.jobPostings$ = this.referralService.getJobPostings();
  }

  // Helper method to format timestamp
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
