import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReferralService } from '../referral.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recruiting-firms',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './recruiting-firms.component.html',
  styleUrls: ['./recruiting-firms.component.css'],
})
export class RecruitingFirmsComponent implements OnInit {
  recruitingFirms$!: Observable<any[]>;
  selectedFirm: any = null;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.recruitingFirms$ = this.referralService.getRecruitingFirms();
  }

  openModal(firm: any) {
    this.selectedFirm = firm;
  }

  closeModal() {
    this.selectedFirm = null;
  }
}
