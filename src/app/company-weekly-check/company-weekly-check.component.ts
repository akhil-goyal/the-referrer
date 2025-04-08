import { Component, OnInit } from '@angular/core';
import { WeeklyCheckService } from './../weekly-check.service';
import { WeeklyCheck } from './../../types/weekly-check';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-weekly-check',
  imports: [CommonModule],
  templateUrl: './company-weekly-check.component.html',
  styleUrls: ['./company-weekly-check.component.css'],
})
export class CompanyWeeklyCheckComponent implements OnInit {
  checks$!: Observable<WeeklyCheck[]>;

  constructor(private weeklyCheckService: WeeklyCheckService) {}

  ngOnInit(): void {
    this.checks$ = this.weeklyCheckService.getChecks('company');
  }

  async onCheckChange(check: WeeklyCheck): Promise<void> {
    await this.weeklyCheckService.updateCheck(check);
  }
}
