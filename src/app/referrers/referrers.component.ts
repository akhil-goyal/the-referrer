import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-referrers',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './referrers.component.html',
  styleUrls: ['./referrers.component.css'],
})
export class ReferrersComponent implements OnInit {
  referrers$!: Observable<string[]>;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.referrers$ = this.referralService.getReferrals().pipe(
      map((referrals) => {
        const referrerSet = new Set<string>();
        referrals.forEach((person) => referrerSet.add(person.name));
        return Array.from(referrerSet).sort();
      })
    );
  }
}
