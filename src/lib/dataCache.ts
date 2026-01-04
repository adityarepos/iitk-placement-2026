// Global data cache for performance optimization
import type { CompanyProforma, StatsData } from "@/types/placement";
import { getAssetPath } from "./config";

interface DataCache {
  stats: StatsData | null;
  proforma: CompanyProforma[] | null;
  statsLoaded: boolean;
  proformaLoaded: boolean;
}

const cache: DataCache = {
  stats: null,
  proforma: null,
  statsLoaded: false,
  proformaLoaded: false,
};

export async function getStatsData(): Promise<StatsData> {
  if (cache.statsLoaded && cache.stats) {
    return cache.stats;
  }
  
  const response = await fetch(getAssetPath("data/stats.json"));
  if (!response.ok) throw new Error("Failed to load stats data");
  cache.stats = await response.json();
  cache.statsLoaded = true;
  return cache.stats!;
}

export async function getProformaData(): Promise<CompanyProforma[]> {
  if (cache.proformaLoaded && cache.proforma) {
    return cache.proforma;
  }
  
  const response = await fetch(getAssetPath("data/merged_company_data.json"));
  if (!response.ok) throw new Error("Failed to load company data");
  cache.proforma = await response.json();
  cache.proformaLoaded = true;
  return cache.proforma!;
}

// Preload only critical data (stats is smallest and shown first)
export function preloadData() {
  getStatsData().catch(console.error);
}

// Preload proforma data when user is likely to need it
export function preloadProformaData() {
  getProformaData().catch(console.error);
}
