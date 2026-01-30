// Data cache for 2025 placement data
import type { StudentPlacement2025, CompanyProforma2025, Resume2025 } from "@/types/placement2025";
import { getAssetPath } from "./config";

interface DataCache2025 {
  stats: StudentPlacement2025[] | null;
  proforma: CompanyProforma2025[] | null;
  resumes: Resume2025[] | null;
  statsLoaded: boolean;
  proformaLoaded: boolean;
  resumesLoaded: boolean;
  statsPromise: Promise<StudentPlacement2025[]> | null;
  proformaPromise: Promise<CompanyProforma2025[]> | null;
  resumesPromise: Promise<Resume2025[]> | null;
}

const cache2025: DataCache2025 = {
  stats: null,
  proforma: null,
  resumes: null,
  statsLoaded: false,
  proformaLoaded: false,
  resumesLoaded: false,
  statsPromise: null,
  proformaPromise: null,
  resumesPromise: null,
};

export async function getStatsData2025(): Promise<StudentPlacement2025[]> {
  if (cache2025.statsLoaded && cache2025.stats) {
    return cache2025.stats;
  }
  
  if (cache2025.statsPromise) {
    return cache2025.statsPromise;
  }
  
  cache2025.statsPromise = (async () => {
    const response = await fetch(getAssetPath("data/2025/stats.json"));
    if (!response.ok) throw new Error("Failed to load 2025 stats data");
    cache2025.stats = await response.json();
    cache2025.statsLoaded = true;
    cache2025.statsPromise = null;
    return cache2025.stats!;
  })();
  
  return cache2025.statsPromise;
}

export async function getProformaData2025(): Promise<CompanyProforma2025[]> {
  if (cache2025.proformaLoaded && cache2025.proforma) {
    return cache2025.proforma;
  }
  
  if (cache2025.proformaPromise) {
    return cache2025.proformaPromise;
  }
  
  cache2025.proformaPromise = (async () => {
    const response = await fetch(getAssetPath("data/2025/company_data.json"));
    if (!response.ok) throw new Error("Failed to load 2025 proforma data");
    cache2025.proforma = await response.json();
    cache2025.proformaLoaded = true;
    cache2025.proformaPromise = null;
    return cache2025.proforma!;
  })();
  
  return cache2025.proformaPromise;
}

export async function getResumesData2025(): Promise<Resume2025[]> {
  if (cache2025.resumesLoaded && cache2025.resumes) {
    return cache2025.resumes;
  }
  
  if (cache2025.resumesPromise) {
    return cache2025.resumesPromise;
  }
  
  cache2025.resumesPromise = (async () => {
    const response = await fetch(getAssetPath("data/2025/resumes.json"));
    if (!response.ok) throw new Error("Failed to load 2025 resumes data");
    cache2025.resumes = await response.json();
    cache2025.resumesLoaded = true;
    cache2025.resumesPromise = null;
    return cache2025.resumes!;
  })();
  
  return cache2025.resumesPromise;
}

export function preloadData2025(): void {
  getStatsData2025().catch(console.error);
}

export function preloadProformaData2025(): void {
  getProformaData2025().catch(console.error);
}

export function preloadResumesData2025(): void {
  getResumesData2025().catch(console.error);
}
