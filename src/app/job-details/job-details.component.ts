import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { JobPosting } from './../../types/referrer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css'],
})
export class JobDetailsComponent implements OnInit {
  jobPosting$!: Observable<JobPosting | undefined>;

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
