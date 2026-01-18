import { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Building2, Search, ChevronLeft, ChevronRight, X, ExternalLink, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStatsData, getProformaData, getAnalyticsData, preloadData, preloadProformaData, preloadAnalyticsData } from "@/lib/dataCache";
import { getBranchName } from "@/lib/branchMapping";
import { PAGE_SIZES, DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/lib/constants";
import { getPaginationPages, getPaginationMeta } from "@/utils/pagination";
import type { CompanyProforma, StudentPlacement, AnalyticsData } from "@/types/placement";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { StudentHoverCard } from "@/components/StudentHoverCard";

// Preload stats data on module load (smallest file, shown first)
preloadData();

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Restore state from sessionStorage (for browser back) or location.state (for app navigation)
  const getInitialState = () => {
    const locationState = location.state as {
      activeTab?: string;
      searchQuery?: string;
      currentPage?: number;
      pageSize?: string;
      scrollY?: number;
    } | null;
    
    // Try sessionStorage first (for browser back button)
    const stored = sessionStorage.getItem('indexPageState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch {
        // Fall through to location state
      }
    }
    
    return locationState;
  };
  
  const initialState = getInitialState();
  
  // Simple state
  const [activeTab, setActiveTab] = useState(initialState?.activeTab || "stats");
  const [searchQuery, setSearchQuery] = useState(initialState?.searchQuery || "");
  const [currentPage, setCurrentPage] = useState(initialState?.currentPage || DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<string>(initialState?.pageSize || DEFAULT_PAGE_SIZE);

  // Data state - load separately
  const [statsData, setStatsData] = useState<StudentPlacement[]>([]);
  const [proformaData, setProformaData] = useState<CompanyProforma[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [proformaLoading, setProformaLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load stats on mount (critical data)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getStatsData();
        setStatsData(stats.student || []);
        setStatsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Load proforma data when tab changes to proforma (lazy load)
  useEffect(() => {
    if (activeTab === "proforma" && proformaData.length === 0 && !proformaLoading) {
      setProformaLoading(true);
      setLoadingProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      getProformaData()
        .then(data => {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setProformaData(data);
          setTimeout(() => {
            setProformaLoading(false);
            setLoadingProgress(0);
          }, 300);
        })
        .catch(err => {
          clearInterval(progressInterval);
          setError(err instanceof Error ? err.message : "Failed to load proforma data");
          setProformaLoading(false);
          setLoadingProgress(0);
        });
    }
  }, [activeTab, proformaData.length, proformaLoading]);

  // Load analytics data when tab changes to analytics (lazy load)
  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData && !analyticsLoading) {
      setAnalyticsLoading(true);
      setLoadingProgress(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      getAnalyticsData()
        .then(data => {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setAnalyticsData(data);
          setTimeout(() => {
            setAnalyticsLoading(false);
            setLoadingProgress(0);
          }, 300);
        })
        .catch(err => {
          clearInterval(progressInterval);
          setError(err instanceof Error ? err.message : "Failed to load analytics data");
          setAnalyticsLoading(false);
          setLoadingProgress(0);
        });
    }
  }, [activeTab, analyticsData, analyticsLoading]);

  // Restore scroll position and clear sessionStorage after restoring state
  useEffect(() => {
    const stored = sessionStorage.getItem('indexPageState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.scrollY) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            window.scrollTo({ top: parsed.scrollY, behavior: 'instant' });
          });
        }
      } catch {
        // Ignore
      }
      // Clear after restoring
      sessionStorage.removeItem('indexPageState');
    }
  }, []);

  // Preload proforma data on hover (for faster tab switch)
  const handleProformaHover = useCallback(() => {
    if (proformaData.length === 0) {
      preloadProformaData();
    }
  }, [proformaData.length]);

  // Preload analytics data on hover
  const handleAnalyticsHover = useCallback(() => {
    if (!analyticsData) {
      preloadAnalyticsData();
    }
  }, [analyticsData]);

  // Filter stats data
  const filteredStats = useMemo(() => {
    if (!searchQuery) return statsData;
    const query = searchQuery.toLowerCase();
    return statsData.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.roll_no.toString().includes(query) ||
      s.company_name.toLowerCase().includes(query) ||
      s.profile.toLowerCase().includes(query) ||
      getBranchName(s.program_department_id).toLowerCase().includes(query)
    );
  }, [statsData, searchQuery]);

  // Filter proforma data
  const filteredProforma = useMemo(() => {
    if (!searchQuery) return proformaData;
    const query = searchQuery.toLowerCase();
    return proformaData.filter(c => 
      c.ID.toString().includes(query) ||
      (c.company_name?.toLowerCase() || "").includes(query) ||
      (c.role?.toLowerCase() || "").includes(query) ||
      (c.profile?.toLowerCase() || "").includes(query)
    );
  }, [proformaData, searchQuery]);

  // Get current data based on active tab
  const currentData = activeTab === "stats" ? filteredStats : filteredProforma;
  const pageSizeNum = pageSize === "all" ? currentData.length : parseInt(pageSize, 10);
  const paginationMeta = getPaginationMeta(currentPage, pageSizeNum, currentData.length);
  const { totalPages, validPage, startIdx, endIdx } = paginationMeta;
  
  // Compute paginated data separately for each tab to avoid type issues
  const paginatedStats = filteredStats.slice(startIdx, endIdx);
  const paginatedProforma = filteredProforma.slice(startIdx, endIdx);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (id: number) => {
    // Save current state to sessionStorage for browser back button
    sessionStorage.setItem('indexPageState', JSON.stringify({
      activeTab,
      searchQuery,
      currentPage,
      pageSize,
      scrollY: window.scrollY
    }));
    
    navigate(`/details/${id}`, {
      state: {
        fromIndex: true,
        activeTab,
        searchQuery,
        currentPage,
        pageSize,
        scrollY: window.scrollY
      }
    });
  };

  const pageNumbers = useMemo(
    () => getPaginationPages(validPage, totalPages),
    [validPage, totalPages]
  );

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-transition">
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full animate-fade-in">
          {/* Tabs + Search Row */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <TabsList className="grid w-full sm:w-auto sm:max-w-[300px] grid-cols-3">
                <TabsTrigger value="stats" className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  Stats
                </TabsTrigger>
                <TabsTrigger 
                  value="proforma" 
                  className="flex items-center gap-1.5"
                  onMouseEnter={handleProformaHover}
                >
                  <Building2 className="h-4 w-4 shrink-0 stroke-[2.5]" />
                  Proforma
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-1.5"
                  onMouseEnter={handleAnalyticsHover}
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <a
                href="https://spo-iitk-2025.github.io/iitk-2025-placement/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Placement 2025
              </a>
              <a
                href="https://spo-iitk-2025.github.io/iitk-2025-placement/"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
              >
                <ExternalLink className="h-3 w-3" />
                '25
              </a>
            </div>

              <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-9 w-full sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <ThemeToggle />
            </div>
            </div>
          </div>

          <TabsContent value="stats" className="mt-0">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedStats.map((student, idx) => (
                <div key={`${student.roll_no}-${idx}`} className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-card-foreground">
                      <StudentHoverCard rollNo={student.roll_no} name={student.name}>
                        {student.name}
                      </StudentHoverCard>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0">{student.roll_no}</div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[80px]">Company:</span>
                      <span className="text-card-foreground">{student.company_name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[80px]">Profile:</span>
                      <span className="text-card-foreground">{student.profile}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[80px]">Branch:</span>
                      <span className="text-card-foreground">{getBranchName(student.program_department_id)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Roll No.</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Company Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Profile</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Branch</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Resume Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStats.map((student, idx) => (
                      <tr key={`${student.roll_no}-${idx}`} className="border-b border-border hover:bg-accent/30">
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">
                          <StudentHoverCard rollNo={student.roll_no} name={student.name}>
                            {student.name}
                          </StudentHoverCard>
                        </td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.roll_no}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.company_name}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.profile}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{getBranchName(student.program_department_id)}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proforma" className="mt-0">
            {proformaLoading ? (
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loading company data... {loadingProgress}%
                  </div>
                </div>
              </div>
            ) : (
            <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedProforma.map((company, idx) => (
                <div key={`${company.ID}-${idx}`} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-card-foreground">{company.company_name || "-"}</div>
                    <div className="text-xs text-muted-foreground shrink-0">ID: {company.ID}</div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[70px]">Role:</span>
                      <span className="text-card-foreground">{company.role || "-"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[70px]">Profile:</span>
                      <span className="text-card-foreground">{company.profile || "-"}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(company.ID)}
                    className="w-full text-xs"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">ID</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Company Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Role Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Profile</th>
                      <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">View Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProforma.map((company, idx) => (
                      <tr key={`${company.ID}-${idx}`} className="border-b border-border hover:bg-accent/30">
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company.ID}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company.company_name || "-"}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company.role || "-"}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company.profile || "-"}</td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(company.ID)}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            {analyticsLoading ? (
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loading analytics data... {loadingProgress}%
                  </div>
                </div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                {/* Disclaimer */}
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Note:</span> Analytics data may not be 100% accurate but is <span className="font-bold">close to exact</span>.
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  <div className="rounded-lg border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4">
                    <div className="text-sm text-muted-foreground mb-1">Registered Students</div>
                    <div className="text-2xl font-bold text-card-foreground">{analyticsData.placement_overview.registered_students.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
                    <div className="text-sm text-muted-foreground mb-1">Students Placed</div>
                    <div className="text-2xl font-bold text-card-foreground">{analyticsData.placement_overview.students_placed.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4">
                    <div className="text-sm text-muted-foreground mb-1">PPOs Received</div>
                    <div className="text-2xl font-bold text-card-foreground">{analyticsData.placement_overview.ppo_received.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4">
                    <div className="text-sm text-muted-foreground mb-1">Placement Rate</div>
                    <div className="text-2xl font-bold text-card-foreground">{analyticsData.placement_overview.placement_percentage.toFixed(1)}%</div>
                  </div>
                  <div className="rounded-lg border border-border bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Offers</div>
                    <div className="text-2xl font-bold text-card-foreground">{analyticsData.placement_overview.total_offers_generated.toLocaleString()}</div>
                  </div>
                </div>

                {/* Salary Insights */}
                <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4 text-card-foreground">Salary Insights (LPA)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-accent/20">
                      <div className="text-sm text-muted-foreground mb-1">Average CTC</div>
                      <div className="text-xl font-bold text-primary">₹{analyticsData.salary_insights_lpa.average_ctc.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-accent/20">
                      <div className="text-sm text-muted-foreground mb-1">Median CTC</div>
                      <div className="text-xl font-bold text-primary">₹{analyticsData.salary_insights_lpa.median_ctc.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-accent/20">
                      <div className="text-sm text-muted-foreground mb-1">Highest CTC</div>
                      <div className="text-xl font-bold text-primary">₹{analyticsData.salary_insights_lpa.highest_ctc.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {/* CTC Distribution */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-card-foreground">CTC Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.salary_insights_lpa.ctc_distribution)
                        .sort((a, b) => {
                          const order = ['< 10 LPA', '10-20 LPA', '20-30 LPA', '30-50 LPA', '50+ LPA'];
                          return order.indexOf(a[0]) - order.indexOf(b[0]);
                        })
                        .map(([range, count]) => {
                          const maxCount = Math.max(...Object.values(analyticsData.salary_insights_lpa.ctc_distribution));
                          const percentage = (count / maxCount) * 100;
                          return (
                            <div key={range} className="flex items-center gap-3">
                              <div className="w-24 text-xs text-muted-foreground shrink-0">{range}</div>
                              <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-2 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                >
                                  {percentage > 20 && <span className="text-xs font-medium text-white">{count}</span>}
                                </div>
                              </div>
                              {percentage <= 20 && <div className="text-xs font-medium text-card-foreground w-8">{count}</div>}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Top Recruiters and Roles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Top Recruiters */}
                  <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 text-card-foreground">Top Recruiters</h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.top_recruiters)
                        .slice(0, 10)
                        .map(([company, count], idx) => (
                          <div key={company} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-card-foreground truncate">{company}</div>
                            </div>
                            <div className="text-sm font-semibold text-primary shrink-0">{count}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Top Roles */}
                  <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 text-card-foreground">Top Roles</h3>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.top_roles)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([role, count], idx) => (
                          <div key={role} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-card-foreground truncate">{role}</div>
                            </div>
                            <div className="text-sm font-semibold text-secondary-foreground shrink-0">{count}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Department Performance Table */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-card-foreground">Department Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary">
                        <tr>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Department</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Total</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Recruited</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">PPO</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Placement %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.department_performance
                          .filter(dept => dept.total > 0)
                          .sort((a, b) => {
                            // Get branch names
                            const branchA = getBranchName(a.program_department_id);
                            const branchB = getBranchName(b.program_department_id);
                            
                            // Extract program type (BT, BS, etc.)
                            const getProgramType = (branch: string) => {
                              if (branch.startsWith('BT-')) return 1;
                              if (branch.startsWith('BS-')) return 2;
                              if (branch.startsWith('Dual')) return 3;
                              if (branch.startsWith('DoubleMajor')) return 4;
                              return 5;
                            };
                            
                            const typeA = getProgramType(branchA);
                            const typeB = getProgramType(branchB);
                            
                            // First sort by program type
                            if (typeA !== typeB) return typeA - typeB;
                            
                            // Within same type, sort by placement rate (descending)
                            return b.placement_rate - a.placement_rate;
                          })
                          .map((dept, idx) => (
                            <tr key={dept.program_department_id} className="border-b border-border hover:bg-accent/30">
                              <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{getBranchName(dept.program_department_id)}</td>
                              <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{dept.total}</td>
                              <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{dept.recruited}</td>
                              <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{dept.pre_offer}</td>
                              <td className="px-3 py-2 text-xs sm:text-sm">
                                <span className={`font-medium ${
                                  dept.placement_rate >= 70 ? 'text-green-600 dark:text-green-400' :
                                  dept.placement_rate >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                  dept.placement_rate >= 30 ? 'text-amber-600 dark:text-amber-400' :
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {dept.placement_rate.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* Pagination */}
          {activeTab !== "analytics" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4">
            <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
              Showing {startIdx + 1} to {Math.min(endIdx, currentData.length)} of {currentData.length} entries
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
              <Select value={pageSize} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-16 sm:w-20 h-8 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-1 sm:flex-initial justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  className="h-8 w-8 sm:w-9 p-0"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                {pageNumbers.map((page, idx) => 
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === validPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className="min-w-[28px] sm:min-w-[36px] h-8 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage === totalPages}
                  className="h-8 w-8 sm:w-9 p-0"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          IITK Placement 2026 (only Phase 1 right now)
        </div>
      </footer>
    </div>
  );
};

export default Index;
