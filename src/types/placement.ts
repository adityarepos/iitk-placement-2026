export interface StudentPlacement {
  id: number;
  name: string;
  email: string;
  roll_no: string;
  program_department_id: number;
  secondary_program_department_id: number;
  company_name: string;
  profile: string;
  type: string;
}

export interface BranchStats {
  program_department_id: number;
  total: number;
  pre_offer: number;
  recruited: number;
}

export interface StatsData {
  branch: BranchStats[];
  student: StudentPlacement[];
}

export interface CompanyProforma {
  ID: number;
  company_name: string;
  eligibility: string;
  role: string;
  profile: string;
  tentative_job_location: string;
  job_description: string;
  cost_to_company: string;
  package_details: string;
  bond_details: string;
  skill_set: string;
  ctc_inr: string;
  gross: string;
  take_home: string;
  base: string;
  joining_bonus: string;
  relocation_bonus: string;
  first_ctc: string;
  retention_bonus: string;
  deductions: string;
  perks: string;
  timeline_events?: TimelineNotice[];
}

export interface TimelineNotice {
  title: string;
  description: string;
  created_at: string;
  id: number;
  tags?: string;
}

export interface TimelineEvent {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  recruitment_cycle_id: number;
  title: string;
  description: string;
  tags: string;
  attachment: string;
  created_by: string;
  last_reminder_at: number;
  deadline: number;
}
