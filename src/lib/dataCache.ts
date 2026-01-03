// Global data cache for performance optimization
import type { CompanyProforma, StatsData, TimelineEvent } from "@/types/placement";
import { getAssetPath } from "./config";

interface DataCache {
  stats: StatsData | null;
  proforma: CompanyProforma[] | null;
  timeline: TimelineEvent[] | null;
  timelineIndex: Map<string, TimelineEvent[]> | null;
  statsLoaded: boolean;
  proformaLoaded: boolean;
  timelineLoaded: boolean;
}

const cache: DataCache = {
  stats: null,
  proforma: null,
  timeline: null,
  timelineIndex: null,
  statsLoaded: false,
  proformaLoaded: false,
  timelineLoaded: false,
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
  
  const response = await fetch(getAssetPath("data/linked_company_details.json"));
  if (!response.ok) throw new Error("Failed to load company data");
  cache.proforma = await response.json();
  cache.proformaLoaded = true;
  return cache.proforma!;
}

export async function getTimelineData(): Promise<TimelineEvent[]> {
  if (cache.timelineLoaded && cache.timeline) {
    return cache.timeline;
  }
  
  const response = await fetch(getAssetPath("data/linked_timeline.json"));
  if (!response.ok) throw new Error("Failed to load timeline data");
  cache.timeline = await response.json();
  cache.timelineLoaded = true;
  return cache.timeline!;
}

// Build index mapping company names to their timeline events
async function buildTimelineIndex(): Promise<Map<string, TimelineEvent[]>> {
  if (cache.timelineIndex) {
    return cache.timelineIndex;
  }
  
  const [timeline, proforma] = await Promise.all([getTimelineData(), getProformaData()]);
  const index = new Map<string, TimelineEvent[]>();
  
  // Get all company names for matching
  const companyNames = proforma.map(c => c.company_name?.toLowerCase() || "").filter(Boolean);
  
  // Pre-sort timeline by date descending
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
  );
  
  // Index each event by matching company names
  for (const event of sortedTimeline) {
    const title = event.title?.toLowerCase() || "";
    const description = event.description?.toLowerCase() || "";
    const tags = event.tags?.toLowerCase() || "";
    const searchText = `${title} ${description} ${tags}`;
    
    for (const companyName of companyNames) {
      if (searchText.includes(companyName)) {
        const existing = index.get(companyName) || [];
        existing.push(event);
        index.set(companyName, existing);
      }
    }
  }
  
  cache.timelineIndex = index;
  return index;
}

// Get timeline events for a specific company (instant lookup)
export async function getTimelineForCompany(companyName: string): Promise<TimelineEvent[]> {
  const index = await buildTimelineIndex();
  return index.get(companyName.toLowerCase()) || [];
}

// Preload all data sets
export function preloadData() {
  getStatsData().catch(console.error);
  getProformaData().catch(console.error);
  buildTimelineIndex().catch(console.error);
}
