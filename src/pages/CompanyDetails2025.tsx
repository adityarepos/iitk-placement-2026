import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Briefcase, DollarSign, FileText, Users, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProformaData2025 } from "@/lib/dataCache2025";
import type { CompanyProforma2025 } from "@/types/placement2025";
import { idToBranch } from "@/lib/branchMapping";
import { PROGRAMS, DEPARTMENTS } from "@/lib/constants";

// Build eligibility map for 2025 data (Y/N/- format)
function buildEligibilityMap2025(eligibilityStr: string): Map<string, boolean | null> {
  const map = new Map<string, boolean | null>();
  const sortedIds = Object.keys(idToBranch)
    .map(Number)
    .filter(id => id !== 200)
    .sort((a, b) => a - b);
  
  sortedIds.forEach((id, index) => {
    const branch = idToBranch[id];
    if (branch && index < eligibilityStr.length) {
      const char = eligibilityStr[index];
      map.set(branch, char === "Y" ? true : char === "N" ? false : null);
    }
  });
  return map;
}

// Get eligibility status for a specific program-department combination
function getEligibility2025(
  eligibilityMap: Map<string, boolean | null>, 
  program: string, 
  dept: string
): boolean | null {
  const key = `${program}-${dept}`;
  return eligibilityMap.has(key) ? eligibilityMap.get(key)! : null;
}

function EligibilityIcon({ eligible }: { eligible: boolean | null }) {
  if (eligible === true) return <Check className="h-4 w-4 text-green-500" />;
  if (eligible === false) return <X className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

const CompanyDetails2025 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<CompanyProforma2025 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const data = await getProformaData2025();
        const idx = parseInt(id || "0", 10);
        if (idx >= 0 && idx < data.length) {
          setCompany(data[idx]);
        } else {
          setError("Company not found");
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  const handleBack = () => {
    const state = location.state as { fromIndex?: boolean } | null;
    if (state?.fromIndex) {
      navigate("/2025", { state: location.state });
    } else {
      navigate("/2025");
    }
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
        <div className="text-destructive">{error || "Company not found"}</div>
        <Button onClick={() => navigate("/2025")}>Back to 2025</Button>
      </div>
    );
  }

  const InfoSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-card-foreground whitespace-pre-wrap">{value || "-"}</span>
    </div>
  );

  const eligibilityMap = buildEligibilityMap2025(company["Eligibility"] || "");

  return (
    <div className="min-h-screen bg-background flex flex-col page-transition">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="h-9 gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to 2025</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="text-sm font-medium text-muted-foreground border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                2025 Data
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Company Header */}
          <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">
              {company["Company Name"]?.trim() || "Unknown Company"}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {company["Profile"] || "-"}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {company["Job Location"] || "-"}
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {company["Nature of Business"] || "-"}
              </div>
            </div>
          </div>

          {/* Compensation */}
          <InfoSection title="Compensation" icon={DollarSign}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 border border-green-200 dark:border-green-800">
                <div className="text-xs text-muted-foreground mb-1">CTC (INR)</div>
                <div className="text-lg font-bold text-card-foreground">{company["CTC (in INR)"] || "-"}</div>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-muted-foreground mb-1">Gross (per annum)</div>
                <div className="text-lg font-bold text-card-foreground">{company["Gross (per annum)"] || "-"}</div>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-muted-foreground mb-1">1st Year CTC</div>
                <div className="text-lg font-bold text-card-foreground">{company["1st Year CTC"] || "-"}</div>
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label="Base Salary" value={company["Base Salary"]} />
              <InfoRow label="Fixed Take Home" value={company["Fixed take home salary (per annum)"]} />
              <InfoRow label="Joining Bonus" value={company["Joining Bonus"]} />
              <InfoRow label="Relocation Bonus" value={company["Relocation Bonus"]} />
              <InfoRow label="Retention Bonus" value={company["Retention Bonus"]} />
              <InfoRow label="Deductions" value={company["Deductions"]} />
              <InfoRow label="Perks" value={company["Perks"]} />
              <InfoRow label="Cost To Company Details" value={company["Cost To Company"]} />
              <InfoRow label="Total CTC" value={company["Total CTC"]} />
            </div>
          </InfoSection>

          {/* Job Details */}
          <InfoSection title="Job Details" icon={FileText}>
            <div className="space-y-0">
              <InfoRow label="Job Description" value={company["Job Description"]} />
              <InfoRow label="Required Skill Set" value={company["Required Skill Set"]} />
              <InfoRow label="Bond Details" value={company["Bond Details"]} />
              <InfoRow label="Medical Requirements" value={company["Medical Requirements"]} />
            </div>
          </InfoSection>

          {/* Eligibility */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Eligibility
              </CardTitle>
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
                          const eligible = getEligibility2025(eligibilityMap, program, dept);
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
        </div>
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

export default CompanyDetails2025;
