import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { JobPosting } from './../../types/referrer';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-job-posting-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-posting-details.component.html',
  styleUrls: ['./job-posting-details.component.css'],
})
export class JobPostingDetailsComponent implements OnInit {
  jobPosting$!: Observable<JobPosting | undefined>;
  otherJobs$!: Observable<JobPosting[]>;

  constructor(
    private route: ActivatedRoute,
    private referralService: ReferralService
  ) {}

  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobPosting$ = this.referralService
        .getJobPostings()
        .pipe(
          map((postings) => postings.find((posting) => posting.id === jobId))
        );

      // Get other jobs from the same company
      this.otherJobs$ = this.jobPosting$.pipe(
        switchMap((job) => {
          if (!job) return of([]); // Return an empty array if job is not found
          return this.referralService.getJobPostings().pipe(
            map(
              (postings) =>
                postings
                  .filter(
                    (posting) =>
                      posting.companyName === job.companyName &&
                      posting.id !== job.id
                  )
                  .slice(0, 3) // Limit to 3 other jobs
            )
          );
        })
      );
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
