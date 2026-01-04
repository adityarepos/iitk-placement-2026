// Global data cache for performance optimization
import type { CompanyProforma, StatsData } from "@/types/placement";
import { getAssetPath } from "./config";

interface DataCache {
  stats: StatsData | null;
  proforma: CompanyProforma[] | null;
  statsLoaded: boolean;
  proformaLoaded: boolean;
  proformaPromise: Promise<CompanyProforma[]> | null;
  statsPromise: Promise<StatsData> | null;
}

const cache: DataCache = {
  stats: null,
  proforma: null,
  statsLoaded: false,
  proformaLoaded: false,
  proformaPromise: null,
  statsPromise: null,
};

export async function getStatsData(): Promise<StatsData> {
  if (cache.statsLoaded && cache.stats) {
    return cache.stats;
  }
  
  // Prevent duplicate fetches
  if (cache.statsPromise) {
    return cache.statsPromise;
  }
  
  cache.statsPromise = (async () => {
    const response = await fetch(getAssetPath("data/stats.json"));
    if (!response.ok) throw new Error("Failed to load stats data");
    cache.stats = await response.json();
    cache.statsLoaded = true;
    cache.statsPromise = null;
    return cache.stats!;
  })();
  
  return cache.statsPromise;
}

export async function getProformaData(): Promise<CompanyProforma[]> {
  if (cache.proformaLoaded && cache.proforma) {
    return cache.proforma;
  }
  
  // Prevent duplicate fetches
  if (cache.proformaPromise) {
    return cache.proformaPromise;
  }
  
  cache.proformaPromise = (async () => {
    const response = await fetch(getAssetPath("data/merged_company_data.json"));
    if (!response.ok) throw new Error("Failed to load company data");
    cache.proforma = await response.json();
    cache.proformaLoaded = true;
    cache.proformaPromise = null;
    return cache.proforma!;
  })();
  
  return cache.proformaPromise;
}

// Preload only critical data (stats is smallest and shown first)
export function preloadData() {
  getStatsData().catch(console.error);
}

// Preload proforma data when user is likely to need it
export function preloadProformaData() {
  getProformaData().catch(console.error);
}
