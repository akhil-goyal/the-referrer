export interface WeeklyCheck {
  id?: string;
  entityId: string;
  entityName: string;
  type: 'company' | 'recruitingFirm';
  weekStart: string;
  checked: boolean;
  lastWeekMissed?: boolean;
}
