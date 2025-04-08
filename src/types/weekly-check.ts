export interface WeeklyCheck {
  id?: string;
  entityId: string; // Company or RecruitingFirm ID
  entityName: string;
  careerPage: string; // Add career page URL
  type: 'company' | 'recruitingFirm';
  weekStart: string; // ISO date (e.g., "2025-04-07" for Monday)
  checked: boolean;
  lastWeekMissed?: boolean; // For unchecked items carried over
}
