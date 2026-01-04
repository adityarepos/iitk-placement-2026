import { idToBranch } from "@/lib/branchMapping";

/**
 * Build eligibility map from encoded string
 * @param eligibilityStr - Encoded eligibility string
 * @returns Map of branch to eligibility status
 */
export function buildEligibilityMap(eligibilityStr: string): Map<string, boolean | null> {
  const map = new Map<string, boolean | null>();
  const sortedIds = Object.keys(idToBranch)
    .map(Number)
    .filter(id => id !== 200)
    .sort((a, b) => a - b);
  
  sortedIds.forEach((id, index) => {
    const branch = idToBranch[id];
    if (branch && index < eligibilityStr.length) {
      const char = eligibilityStr[index];
      map.set(branch, char === "1" ? true : char === "0" ? false : null);
    }
  });
  return map;
}

/**
 * Get eligibility status for a specific program-department combination
 */
export function getEligibility(
  eligibilityMap: Map<string, boolean | null>, 
  program: string, 
  dept: string
): boolean | null {
  const key = `${program}-${dept}`;
  return eligibilityMap.has(key) ? eligibilityMap.get(key)! : null;
}
