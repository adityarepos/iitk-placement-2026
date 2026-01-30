// 2025 Placement Data Types

export interface StudentPlacement2025 {
  name: string;
  roll_no: string;
  company_name: string;
  profile: string;
  program_department: string;
  proforma_idx: number;
  gross: string | number;
}

export interface CompanyProforma2025 {
  "Company Name": string;
  "Nature of Business": string;
  "Profile": string;
  "Job Location": string;
  "Required Skill Set": string;
  "Job Description": string;
  "CTC (in INR)": string;
  "CTC (in foreign currency)": string;
  "Cost To Company": string;
  "Gross (per annum)": string;
  "Fixed take home salary (per annum)": string;
  "Base Salary": string;
  "Joining Bonus": string;
  "Relocation Bonus": string;
  "Retention Bonus": string;
  "Deductions": string;
  "1st Year CTC": string;
  "Total CTC": string;
  "Perks": string;
  "Bond Details": string;
  "Medical Requirements": string;
  "Eligibility": string;
}

export interface Resume2025 {
  "Resume ID": number;
  "Student Name": string;
  "Student Email": string;
  "Student Roll No": number;
  "Resume Type": string;
  "Resume Link": string;
  "Verification Status": string;
  "Ask Clarification": string | null;
  "Accept": string | null;
  "Reject": string | null;
}
