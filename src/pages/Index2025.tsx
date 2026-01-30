import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Building2, Search, ChevronLeft, ChevronRight, X, FileText, ArrowLeft, ChevronDown, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStatsData2025, getProformaData2025, getResumesData2025, preloadData2025 } from "@/lib/dataCache2025";
import { SHOW_RESUME_LINKS_2025 } from "@/lib/config";
import { PAGE_SIZES, DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/lib/constants";
import { getPaginationPages, getPaginationMeta } from "@/utils/pagination";
import type { StudentPlacement2025, CompanyProforma2025, Resume2025 } from "@/types/placement2025";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { StudentHoverCard } from "@/components/StudentHoverCard";

interface TimelinePlacement {
  company: string;
  slot: string;
  color: string;
}

interface TimelineStudent {
  roll_number: string;
  name: string;
  department: string | null;
  cpi: number;
  email: string;
  placements: TimelinePlacement[];
}

// Component for rendering the timeline view
const TimelineView = ({ data }: { data: TimelineStudent[] }) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Map<string, Set<string>>>(new Map());
  
  const toggleCompany = (slot: string, company: string) => {
    setExpandedCompanies(prev => {
      const newMap = new Map(prev);
      const slotSet = newMap.get(slot) || new Set<string>();
      const newSet = new Set(slotSet);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      newMap.set(slot, newSet);
      return newMap;
    });
  };
  
  // Group placements by slot
  const slotMap = new Map<string, Map<string, {name: string; roll: string; color: string; email: string}[]>>();
  
  data.forEach(student => {
    student.placements.forEach(placement => {
      if (!slotMap.has(placement.slot)) {
        slotMap.set(placement.slot, new Map());
      }
      const companyMap = slotMap.get(placement.slot)!;
      if (!companyMap.has(placement.company)) {
        companyMap.set(placement.company, []);
      }
      companyMap.get(placement.company)!.push({
        name: student.name,
        roll: student.roll_number,
        color: placement.color,
        email: student.email
      });
    });
  });

  // Sort slots
  const sortedSlots = Array.from(slotMap.keys()).sort((a, b) => {
    const aNum = parseFloat(a.split('.')[0]);
    const bNum = parseFloat(b.split('.')[0]);
    if (isNaN(aNum) && isNaN(bNum)) return a.localeCompare(b);
    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;
    return aNum - bNum || a.localeCompare(b);
  });
  
  return (
    <div className="space-y-8">
      {sortedSlots.map((slot, slotIdx) => {
        const companies = slotMap.get(slot)!;
        const totalPlacements = Array.from(companies.values()).reduce((sum, students) => sum + students.length, 0);
        const slotExpandedCompanies = expandedCompanies.get(slot) || new Set<string>();
        
        return (
          <div key={slot} className="relative">
            {/* Timeline connector line */}
            {slotIdx < sortedSlots.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/20 hidden md:block" />
            )}
            
            {/* Slot Card */}
            <div className="relative rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
              {/* Slot Header */}
              <div className="bg-primary/10 backdrop-blur-sm border-b border-primary/20 px-4 py-3 flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex h-12 w-12 rounded-full bg-primary text-primary-foreground items-center justify-center font-bold text-sm shadow-lg">
                    {slot}
                  </div>
                  <div className="md:hidden h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-lg">
                    {slot}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground">Slot {slot}</h3>
                    <p className="text-sm text-muted-foreground">
                      {companies.size} {companies.size === 1 ? 'Company' : 'Companies'} • {totalPlacements} {totalPlacements === 1 ? 'Placement' : 'Placements'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Companies Table */}
              <div className="p-4">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {Array.from(companies.keys()).map((company) => {
                          const students = companies.get(company)!;
                          const hasMore = students.length > 6;
                          const isExpanded = slotExpandedCompanies.has(company);
                          
                          return (
                            <th 
                              key={company} 
                              className={`text-left text-xs font-semibold text-muted-foreground px-3 py-2 border-r border-border last:border-0 min-w-[150px] ${hasMore ? 'cursor-pointer hover:bg-muted/70' : ''}`}
                              onClick={() => hasMore && toggleCompany(slot, company)}
                            >
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-primary" />
                                <span className="flex-1">{company}</span>
                                <span className="text-primary font-bold">
                                  ({students.length})
                                </span>
                                {hasMore && (
                                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const maxRows = Math.max(...Array.from(companies.keys()).map(company => {
                          const students = companies.get(company)!;
                          const isExpanded = slotExpandedCompanies.has(company);
                          return students.length > 6 && !isExpanded ? 6 : students.length;
                        }));
                        
                        return Array.from({ length: maxRows }, (_, rowIdx) => (
                          <tr key={rowIdx} className="border-t border-border hover:bg-accent/30">
                            {Array.from(companies.keys()).map((company) => {
                              const students = companies.get(company)!;
                              const isExpanded = slotExpandedCompanies.has(company);
                              const displayLimit = students.length > 6 && !isExpanded ? 6 : students.length;
                              const student = rowIdx < displayLimit ? students[rowIdx] : null;
                              
                              return (
                                <td key={company} className="px-3 py-2 text-xs border-r border-border last:border-0 align-top">
                                  {student ? (
                                    <div className="flex items-start gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                        student.color === 'green' ? 'bg-green-500' : 
                                        student.color === 'red' ? 'bg-red-500' : 
                                        'bg-gray-400'
                                      }`} />
                                      <div className="flex-1">
                                        <StudentHoverCard rollNo={student.roll} name={student.name} email={student.email}>
                                          <span className={`hover:text-primary font-medium ${
                                            student.color === 'green' ? 'text-green-700 dark:text-green-400' :
                                            student.color === 'red' ? 'text-red-700 dark:text-red-400' :
                                            'text-muted-foreground'
                                          }`}>
                                            {student.name}
                                          </span>
                                        </StudentHoverCard>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                          {student.roll}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-10" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ResumeDropdown component for showing multiple resumes
const ResumeDropdown = ({ resumes }: { resumes: Resume2025[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if dropdown should appear above or below
  const checkPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = resumes.length * 28 + 16; // Approximate height
      setDropUp(spaceBelow < dropdownHeight + 20);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    checkPosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleClick = () => {
    checkPosition();
    setIsOpen(!isOpen);
  };

  if (resumes.length === 0) return <span className="text-muted-foreground">-</span>;

  // Single resume - just show direct link
  if (resumes.length === 1) {
    return (
      <a
        href={resumes[0]["Resume Link"]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center gap-1"
      >
        <FileText className="h-3 w-3" />
        {resumes[0]["Resume Type"] || "Resume"}
      </a>
    );
  }

  // Multiple resumes - show dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
      >
        <FileText className="h-3 w-3" />
        <span>{resumes.length} Resumes</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          className={`absolute z-50 left-0 min-w-[140px] rounded-md border border-border bg-popover shadow-lg ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-1">
            {resumes.map((resume, rIdx) => (
              <a
                key={resume["Resume ID"]}
                href={resume["Resume Link"]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent text-foreground transition-colors"
              >
                <FileText className="h-3 w-3 text-primary" />
                {resume["Resume Type"] || `Resume ${rIdx + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Preload stats data on module load
preloadData2025();

const Index2025 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Restore state from sessionStorage or location.state
  const getInitialState = () => {
    const locationState = location.state as {
      activeTab?: string;
      searchQuery?: string;
      currentPage?: number;
      pageSize?: string;
      scrollY?: number;
    } | null;
    
    const stored = sessionStorage.getItem('index2025PageState');
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

  // Data state
  const [statsData, setStatsData] = useState<StudentPlacement2025[]>([]);
  const [proformaData, setProformaData] = useState<CompanyProforma2025[]>([]);
  const [resumesData, setResumesData] = useState<Resume2025[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineStudent[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [proformaLoading, setProformaLoading] = useState(false);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Create a map of roll_no to all accepted resumes for quick lookup
  const resumeMap = useMemo(() => {
    const map = new Map<string, Resume2025[]>();
    resumesData.forEach(resume => {
      if (resume["Verification Status"] === "Accepted") {
        const rollNo = String(resume["Student Roll No"]);
        const existing = map.get(rollNo) || [];
        existing.push(resume);
        map.set(rollNo, existing);
      }
    });
    return map;
  }, [resumesData]);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getStatsData2025();
        setStatsData(stats || []);
        setStatsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Load proforma data when tab changes
  useEffect(() => {
    if (activeTab === "proforma" && proformaData.length === 0 && !proformaLoading) {
      setProformaLoading(true);
      setLoadingProgress(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      getProformaData2025()
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

  // Load resumes data when tab changes to stats (for resume links)
  useEffect(() => {
    if (activeTab === "stats" && resumesData.length === 0 && !resumesLoading) {
      setResumesLoading(true);
      getResumesData2025()
        .then(data => {
          setResumesData(data);
          setResumesLoading(false);
        })
        .catch(err => {
          console.error("Failed to load resumes:", err);
          setResumesLoading(false);
        });
    }
  }, [activeTab, resumesData.length, resumesLoading]);

  // Load timeline data when tab changes to timeline
  useEffect(() => {
    if (activeTab === "timeline" && timelineData.length === 0 && !timelineLoading) {
      setTimelineLoading(true);
      setLoadingProgress(0);
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      fetch('/data/2025/timeline.json')
        .then(res => res.json())
        .then(data => {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setTimelineData(data);
          setTimeout(() => {
            setTimelineLoading(false);
            setLoadingProgress(0);
          }, 300);
        })
        .catch(err => {
          clearInterval(progressInterval);
          setError(err instanceof Error ? err.message : "Failed to load timeline data");
          setTimelineLoading(false);
          setLoadingProgress(0);
        });
    }
  }, [activeTab, timelineData.length, timelineLoading]);

  // Restore scroll position
  useEffect(() => {
    const stored = sessionStorage.getItem('index2025PageState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.scrollY) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: parsed.scrollY, behavior: 'instant' });
          });
        }
        sessionStorage.removeItem('index2025PageState');
      } catch {
        // Ignore
      }
    }
  }, []);

  // Preload data on hover
  const handleProformaHover = useCallback(() => {
    if (proformaData.length === 0 && !proformaLoading) {
      getProformaData2025().catch(() => {});
    }
  }, [proformaData.length, proformaLoading]);

  // Filter functions
  const filteredStats = useMemo(() => {
    if (!searchQuery) return statsData;
    const query = searchQuery.toLowerCase();
    return statsData.filter(student => 
      student.name?.toLowerCase().includes(query) ||
      student.roll_no?.toLowerCase().includes(query) ||
      student.company_name?.toLowerCase().includes(query) ||
      student.profile?.toLowerCase().includes(query) ||
      student.program_department?.toLowerCase().includes(query)
    );
  }, [statsData, searchQuery]);

  const filteredProforma = useMemo(() => {
    if (!searchQuery) return proformaData;
    const query = searchQuery.toLowerCase();
    return proformaData.filter(company => 
      company["Company Name"]?.toLowerCase().includes(query) ||
      company["Profile"]?.toLowerCase().includes(query) ||
      company["Job Location"]?.toLowerCase().includes(query) ||
      company["Nature of Business"]?.toLowerCase().includes(query)
    );
  }, [proformaData, searchQuery]);

  // Pagination
  const currentData = activeTab === "stats" ? filteredStats : activeTab === "proforma" ? filteredProforma : [];
  const pageSizeNum = pageSize === "all" ? currentData.length : parseInt(pageSize, 10);
  const paginationMeta = getPaginationMeta(currentPage, pageSizeNum, currentData.length);
  const { totalPages, validPage, startIdx, endIdx } = paginationMeta;
  
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

  const handleViewDetails = (idx: number) => {
    sessionStorage.setItem('index2025PageState', JSON.stringify({
      activeTab,
      searchQuery,
      currentPage,
      pageSize,
      scrollY: window.scrollY
    }));
    
    navigate(`/2025/details/${idx}`, {
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

  // Get all accepted resumes for a student
  const getResumes = (rollNo: string): Resume2025[] => {
    return resumeMap.get(rollNo) || [];
  };

  // Get email for a student from resume data (for StudentHoverCard)
  const getEmailFromRollNo = (rollNo: string): string => {
    const resumes = resumeMap.get(rollNo);
    if (resumes && resumes.length > 0 && resumes[0]["Student Email"]) {
      return resumes[0]["Student Email"];
    }
    // Fallback: construct email from roll_no pattern
    return `${rollNo.toLowerCase()}@iitk.ac.in`;
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading 2025 data...</div>
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full animate-fade-in">
          {/* Tabs + Search Row */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="h-9 gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to 2026</span>
                  <span className="sm:hidden">2026</span>
                </Button>
                
                <TabsList className="grid w-full sm:w-auto sm:max-w-[320px] grid-cols-3">
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
                  <TabsTrigger value="timeline" className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
                
                <div className="hidden sm:block text-sm font-medium text-muted-foreground border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                  2025 Data
                </div>
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
              {paginatedStats.map((student, idx) => {
                const resumes = getResumes(student.roll_no);
                return (
                  <div key={`${student.roll_no}-${idx}`} className="rounded-lg border border-border bg-card p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-medium text-card-foreground">
                        <StudentHoverCard rollNo={student.roll_no} name={student.name} email={getEmailFromRollNo(student.roll_no)}>
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
                        <span className="text-card-foreground">{student.program_department}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground min-w-[80px]">Resume:</span>
                        {SHOW_RESUME_LINKS_2025 ? <ResumeDropdown resumes={resumes} /> : <span className="text-muted-foreground">-</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    {paginatedStats.map((student, idx) => {
                      const resumes = getResumes(student.roll_no);
                      return (
                        <tr key={`${student.roll_no}-${idx}`} className="border-b border-border hover:bg-accent/30">
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">
                            <StudentHoverCard rollNo={student.roll_no} name={student.name} email={getEmailFromRollNo(student.roll_no)}>
                              {student.name}
                            </StudentHoverCard>
                          </td>
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.roll_no}</td>
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.company_name}</td>
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.profile}</td>
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{student.program_department}</td>
                          <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">
                            {SHOW_RESUME_LINKS_2025 ? <ResumeDropdown resumes={resumes} /> : <span className="text-muted-foreground">-</span>}
                          </td>
                        </tr>
                      );
                    })}
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
                    <div key={`company-${idx}`} className="rounded-lg border border-border bg-card p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium text-card-foreground">{company["Company Name"]?.trim() || "-"}</div>
                        <div className="text-xs text-muted-foreground shrink-0">#{startIdx + idx + 1}</div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[70px]">Role:</span>
                          <span className="text-card-foreground">{company["Nature of Business"] || "-"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-[70px]">Profile:</span>
                          <span className="text-card-foreground">{company["Profile"] || "-"}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleViewDetails(startIdx + idx)}
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
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">#</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Company Name</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Role Name</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">Profile</th>
                          <th className="text-left text-primary-foreground font-semibold px-3 py-2 text-xs sm:text-sm">View Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProforma.map((company, idx) => (
                          <tr key={`company-${idx}`} className="border-b border-border hover:bg-accent/30">
                            <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{startIdx + idx + 1}</td>
                            <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company["Company Name"]?.trim() || "-"}</td>
                            <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company["Nature of Business"] || "-"}</td>
                            <td className="px-3 py-2 text-xs sm:text-sm text-card-foreground">{company["Profile"] || "-"}</td>
                            <td className="px-3 py-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewDetails(startIdx + idx)}
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

          <TabsContent value="timeline" className="mt-0">
            {timelineLoading ? (
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
                    Loading timeline data... {loadingProgress}%
                  </div>
                </div>
              </div>
            ) : timelineData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No timeline data available
              </div>
            ) : (
              <TimelineView data={timelineData} />
            )}
          </TabsContent>

          {/* Pagination */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4 ${activeTab === 'timeline' ? 'hidden' : ''}`}>
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
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          IITK Placement 2025 Data Archive
        </div>
      </footer>
    </div>
  );
};

export default Index2025;
