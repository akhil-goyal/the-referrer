import { Component, OnInit } from '@angular/core';
import { WeeklyCheckService } from './../weekly-check.service';
import { WeeklyCheck } from './../../types/weekly-check';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiting-firm-weekly-check',
  imports: [CommonModule],
  templateUrl: './recruiting-firm-weekly-check.component.html',
  styleUrls: ['./recruiting-firm-weekly-check.component.css'],
})
export class RecruitingFirmWeeklyCheckComponent implements OnInit {
  checks$!: Observable<WeeklyCheck[]>;

  constructor(private weeklyCheckService: WeeklyCheckService) {}

  ngOnInit(): void {
    this.checks$ = this.weeklyCheckService.getChecks('recruitingFirm');
  }

  async onCheckChange(check: WeeklyCheck): Promise<void> {
    await this.weeklyCheckService.updateCheck(check);
  }
}
