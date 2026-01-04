// Application constants
export const PROGRAMS = [
  "BT", "BS", "DoubleMajor", "DualA", "DualB", "DualC", 
  "MT", "MS", "MSR", "MSc", "MDes", "MBA", "PhD"
] as const;

export const DEPARTMENTS = [
  "AE", "BSBE", "CE", "CHE", "CSE", "EE", "MSE", "ME", 
  "CHM", "ECO", "ES", "MTH", "SDS", "PHY", "CGS", "DES", 
  "MS", "MSP", "NET", "PSE", "Stats", "HSS", "Mathematics", 
  "SEE", "SSA"
] as const;

export const PAGE_SIZES = [
  { value: "15", label: "15" },
  { value: "30", label: "30" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "all", label: "All" }
] as const;

export const DEFAULT_PAGE_SIZE = "15";
export const DEFAULT_PAGE = 1;
export const MAX_PAGINATION_BUTTONS = 5;
