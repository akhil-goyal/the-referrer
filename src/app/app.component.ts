import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReferralSearchComponent } from './referral-search/referral-search.component';

@Component({
  selector: 'app-root',
  imports: [ReferralSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'the-referrer';
}
