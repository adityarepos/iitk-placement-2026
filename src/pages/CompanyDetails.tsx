import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, X, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyProforma, TimelineNotice } from "@/types/placement";
import { getProformaData } from "@/lib/dataCache";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BASE_PATH } from "@/lib/config";
import { PROGRAMS, DEPARTMENTS } from "@/lib/constants";
import { buildEligibilityMap, getEligibility } from "@/utils/eligibility";

function RenderHtml({ html }: { html: string }) {
  if (!html || html === "<p><br></p>") return <span className="text-muted-foreground">-</span>;
  
  // Fix image paths to include base path and /data/ prefix for GitHub Pages
  const fixedHtml = html.replace(
    /src="(extracted_images|timeline_images)\//g,
    `src="${BASE_PATH}data/$1/`
  );
  
  return <div dangerouslySetInnerHTML={{ __html: fixedHtml }} className="prose prose-sm max-w-none dark:prose-invert" />;
}

function EligibilityIcon({ eligible }: { eligible: boolean | null }) {
  if (eligible === true) return <Check className="h-4 w-4 text-green-500" />;
  if (eligible === false) return <X className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function TimelineEvents({ events }: { events: TimelineNotice[] }) {
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [overflowingEvents, setOverflowingEvents] = useState<Set<number>>(new Set());

  const toggleEvent = (eventId: number) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Notices & Updates</h2>
      <div className="space-y-4">
        {events.map((event: TimelineNotice) => {
          const isExpanded = expandedEvents.has(event.id);
          const isOverflowing = overflowingEvents.has(event.id);
          
          return (
            <EventCard
              key={event.id}
              event={event}
              isExpanded={isExpanded}
              isOverflowing={isOverflowing}
              onToggle={() => toggleEvent(event.id)}
              onOverflowDetected={(overflow) => {
                if (overflow && !overflowingEvents.has(event.id)) {
                  setOverflowingEvents(prev => new Set(prev).add(event.id));
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ 
  event, 
  isExpanded, 
  isOverflowing, 
  onToggle, 
  onOverflowDetected 
}: { 
  event: TimelineNotice;
  isExpanded: boolean;
  isOverflowing: boolean;
  onToggle: () => void;
  onOverflowDetected: (overflow: boolean) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;
      const isOverflow = element.scrollHeight > element.clientHeight;
      onOverflowDetected(isOverflow);
    }
  }, [onOverflowDetected]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{event.title}</CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          {new Date(event.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        {event.tags && event.tags.trim() && (
          <div className="flex flex-wrap gap-2 mt-2">
            {event.tags.split(',').map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      {event.description && (
        <CardContent>
          <div ref={contentRef} className={isExpanded ? '' : 'line-clamp-4'}>
            <RenderHtml html={event.description} />
          </div>
          {isOverflowing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="mt-2 text-primary hover:text-primary/80"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<CompanyProforma | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const proformaData = await getProformaData();
        const found = proformaData.find((c) => c.ID.toString() === id);
        if (!found) {
          setError("Company not found");
        } else {
          setCompany(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleBack = () => {
    const previousState = location.state as {
      fromIndex?: boolean;
      activeTab?: string;
      searchQuery?: string;
      currentPage?: number;
      pageSize?: string;
    } | null;

    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      if (previousState?.fromIndex) {
        // Navigate back with the preserved state
        navigate("/", {
          state: {
            activeTab: previousState.activeTab,
            searchQuery: previousState.searchQuery,
            currentPage: previousState.currentPage,
            pageSize: previousState.pageSize
          }
        });
      } else {
        navigate("/");
      }
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading company details...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-destructive text-lg">{error || "Company not found"}</div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Proforma
        </Button>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value || value.trim() === "") return null;
    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-foreground">{value}</dd>
      </div>
    );
  };

  const eligibilityMap = buildEligibilityMap(company.eligibility || "");

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <Button variant="ghost" onClick={handleBack} className="-ml-2 sm:ml-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Proforma</span>
          </Button>
          <ThemeToggle />
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">{company.company_name}</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{company.profile}</p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                  ID: {company.ID}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4 sm:p-6 pt-0">
              <DetailRow label="Role" value={company.role} />
              <DetailRow label="Profile" value={company.profile} />
              <DetailRow label="Location" value={company.tentative_job_location} />
              <DetailRow label="Bond Details" value={company.bond_details} />
              <DetailRow label="Required Skills" value={company.skill_set} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4 sm:p-6 pt-0">
              <DetailRow label="CTC (INR)" value={company.ctc_inr} />
              <DetailRow label="Gross" value={company.gross} />
              <DetailRow label="Take Home" value={company.take_home} />
              <DetailRow label="Base" value={company.base} />
              <DetailRow label="Joining Bonus" value={company.joining_bonus} />
              <DetailRow label="Relocation Bonus" value={company.relocation_bonus} />
              <DetailRow label="Retention Bonus" value={company.retention_bonus} />
              <DetailRow label="First Year CTC" value={company.first_ctc} />
              <DetailRow label="Deductions" value={company.deductions} />
              <DetailRow label="Perks" value={company.perks} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {company.package_details && company.package_details !== "<p><br></p>" && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Package Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <RenderHtml html={company.package_details} />
              </CardContent>
            </Card>
          )}
          
          {company.cost_to_company && company.cost_to_company !== "<p><br></p>" && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Cost to Company Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <RenderHtml html={company.cost_to_company} />
              </CardContent>
            </Card>
          )}
        </div>

        {company.job_description && company.job_description !== "<p><br></p>" && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <RenderHtml html={company.job_description} />
            </CardContent>
          </Card>
        )}

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-1.5 sm:p-2 border-b border-border sticky left-0 bg-card z-10">
                      Program
                    </th>
                    {DEPARTMENTS.map((dept) => (
                      <th key={dept} className="text-center font-medium text-muted-foreground p-1.5 sm:p-2 border-b border-border min-w-[40px] sm:min-w-[50px]">
                        {dept}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROGRAMS.map((program) => (
                    <tr key={program} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="font-medium p-1.5 sm:p-2 sticky left-0 bg-card z-10">
                        {program}
                      </td>
                      {DEPARTMENTS.map((dept) => {
                        const eligible = getEligibility(eligibilityMap, program, dept);
                        return (
                          <td key={`${program}-${dept}`} className="text-center p-1.5 sm:p-2">
                            <div className="flex justify-center">
                              <EligibilityIcon eligible={eligible} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {company.timeline_events && company.timeline_events.length > 0 && (
          <TimelineEvents events={company.timeline_events} />
        )}
      </div>
    </div>
  );
}
