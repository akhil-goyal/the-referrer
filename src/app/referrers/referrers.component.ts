import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-referrers',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './referrers.component.html',
  styleUrls: ['./referrers.component.css'],
})
export class ReferrersComponent {
  referrers: string[] = [];

  constructor(private referralService: ReferralService) {
    this.loadReferrers();
  }

  private loadReferrers() {
    const referrals = this.referralService.getReferrals();
    const referrerSet = new Set<string>();

    // Collect unique referrer names
    referrals.forEach((person) => {
      referrerSet.add(person.name);
    });

    this.referrers = Array.from(referrerSet).sort();
  }
}
