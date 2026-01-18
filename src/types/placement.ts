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

export interface AnalyticsData {
  placement_overview: {
    registered_students: number;
    students_placed: number;
    ppo_received: number;
    placement_percentage: number;
    total_offers_generated: number;
  };
  salary_insights_lpa: {
    average_ctc: number;
    median_ctc: number;
    highest_ctc: number;
    ctc_distribution: Record<string, number>;
  };
  top_recruiters: Record<string, number>;
  top_roles: Record<string, number>;
  department_performance: Array<{
    program_department_id: number;
    total: number;
    recruited: number;
    pre_offer: number;
    placement_rate: number;
  }>;
}

export interface TimelineNotice {
  title: string;
  description: string;
  created_at: string;
  id: number;
  tags?: string;
}
