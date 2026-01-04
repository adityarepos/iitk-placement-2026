import { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Building2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStatsData, getProformaData, preloadData, preloadProformaData } from "@/lib/dataCache";
import { getBranchName } from "@/lib/branchMapping";
import type { CompanyProforma, StudentPlacement } from "@/types/placement";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { StudentHoverCard } from "@/components/StudentHoverCard";

// Preload stats data on module load (smallest file, shown first)
preloadData();

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Restore state from navigation or use defaults
  const savedState = location.state as {
    activeTab?: string;
    searchQuery?: string;
    currentPage?: number;
    pageSize?: string;
  } | null;
  
  // Simple state
  const [activeTab, setActiveTab] = useState(savedState?.activeTab || "stats");
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || "");
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);
  const [pageSize, setPageSize] = useState<string>(savedState?.pageSize || "10");

  // Data state - load separately
  const [statsData, setStatsData] = useState<StudentPlacement[]>([]);
  const [proformaData, setProformaData] = useState<CompanyProforma[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [proformaLoading, setProformaLoading] = useState(false);
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
      getProformaData()
        .then(data => {
          setProformaData(data);
          setProformaLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : "Failed to load proforma data");
          setProformaLoading(false);
        });
    }
  }, [activeTab, proformaData.length, proformaLoading]);

  // Preload proforma data on hover (for faster tab switch)
  const handleProformaHover = useCallback(() => {
    if (proformaData.length === 0) {
      preloadProformaData();
    }
  }, [proformaData.length]);

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
  const pageSizeNum = pageSize === "all" ? currentData.length || 1 : parseInt(pageSize, 10);
  const totalPages = Math.max(1, Math.ceil(currentData.length / pageSizeNum));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const startIdx = (validPage - 1) * pageSizeNum;
  const endIdx = pageSize === "all" ? currentData.length : startIdx + pageSizeNum;
  
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
  };

  const handleViewDetails = (id: number) => {
    navigate(`/details/${id}`, {
      state: {
        fromIndex: true,
        activeTab,
        searchQuery,
        currentPage,
        pageSize
      }
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validPage > 3) pages.push("...");
      
      const start = Math.max(2, validPage - 1);
      const end = Math.min(totalPages - 1, validPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (validPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs + Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="grid w-full max-w-[200px] grid-cols-2">
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
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-9 w-64"
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

          <TabsContent value="stats" className="mt-0">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Roll No.</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Company Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Profile</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Branch</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Resume Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStats.map((student, idx) => (
                      <tr key={`${student.roll_no}-${idx}`} className="border-b border-border hover:bg-accent/30">
                        <td className="px-4 py-3 text-card-foreground">
                          <StudentHoverCard rollNo={student.roll_no} name={student.name}>
                            {student.name}
                          </StudentHoverCard>
                        </td>
                        <td className="px-4 py-3 text-card-foreground">{student.roll_no}</td>
                        <td className="px-4 py-3 text-card-foreground">{student.company_name}</td>
                        <td className="px-4 py-3 text-card-foreground">{student.profile}</td>
                        <td className="px-4 py-3 text-card-foreground">{getBranchName(student.program_department_id)}</td>
                        <td className="px-4 py-3 text-card-foreground">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proforma" className="mt-0">
            {proformaLoading ? (
              <div className="rounded-lg border border-border bg-card p-8 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading proforma data...</div>
              </div>
            ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">ID</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Company Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Role Name</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">Profile</th>
                      <th className="text-left text-primary-foreground font-semibold px-4 py-3">View Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProforma.map((company, idx) => (
                      <tr key={`${company.ID}-${idx}`} className="border-b border-border hover:bg-accent/30">
                        <td className="px-4 py-3 text-card-foreground">{company.ID}</td>
                        <td className="px-4 py-3 text-card-foreground">{company.company_name || "-"}</td>
                        <td className="px-4 py-3 text-card-foreground">{company.role || "-"}</td>
                        <td className="px-4 py-3 text-card-foreground">{company.profile || "-"}</td>
                        <td className="px-4 py-3">
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
            )}
          </TabsContent>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIdx + 1} to {Math.min(endIdx, currentData.length)} of {currentData.length} entries
            </div>
            <div className="flex items-center gap-3">
              <Select value={pageSize} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page, idx) => 
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === validPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className="min-w-[36px]"
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
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          IITK Placement 2026 (only Phase 1 right now)
        </div>
      </footer>
    </div>
  );
};

export default Index;
