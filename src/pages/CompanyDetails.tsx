import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyProforma } from "@/types/placement";
import { idToBranch } from "@/lib/branchMapping";
import { getProformaData } from "@/lib/dataCache";
import { ThemeToggle } from "@/components/ThemeToggle";

function RenderHtml({ html }: { html: string }) {
  if (!html || html === "<p><br></p>") return <span className="text-muted-foreground">-</span>;
  
  // Fix image paths to include /data/ prefix
  const fixedHtml = html.replace(
    /src="(extracted_images|timeline_images)\//g,
    'src="/data/$1/'
  );
  
  return <div dangerouslySetInnerHTML={{ __html: fixedHtml }} className="prose prose-sm max-w-none dark:prose-invert" />;
}

const PROGRAMS = ["BT", "BS", "DoubleMajor", "DualA", "DualB", "DualC", "MT", "MS", "MSR", "MSc", "MDes", "MBA", "PhD"];
const DEPARTMENTS = [
  "AE", "BSBE", "CE", "CHE", "CSE", "EE", "MSE", "ME", "CHM", "ECO", "ES", "MTH",
  "SDS", "PHY", "CGS", "DES", "MS", "MSP", "NET", "PSE", "Stats", "HSS",
  "Mathematics", "SEE", "SSA"
];

function buildEligibilityMap(eligibilityStr: string): Map<string, boolean | null> {
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

function getEligibility(eligibilityMap: Map<string, boolean | null>, program: string, dept: string): boolean | null {
  const key = `${program}-${dept}`;
  return eligibilityMap.has(key) ? eligibilityMap.get(key)! : null;
}

function EligibilityIcon({ eligible }: { eligible: boolean | null }) {
  if (eligible === true) return <Check className="h-4 w-4 text-green-500" />;
  if (eligible === false) return <X className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    navigate("/");
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proforma
          </Button>
          <ThemeToggle />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl">{company.company_name}</CardTitle>
                <p className="text-muted-foreground mt-1">{company.profile}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                  ID: {company.ID}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Role" value={company.role} />
              <DetailRow label="Profile" value={company.profile} />
              <DetailRow label="Location" value={company.tentative_job_location} />
              <DetailRow label="Bond Details" value={company.bond_details} />
              <DetailRow label="Required Skills" value={company.skill_set} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {company.package_details && company.package_details !== "<p><br></p>" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <RenderHtml html={company.package_details} />
              </CardContent>
            </Card>
          )}
          
          {company.cost_to_company && company.cost_to_company !== "<p><br></p>" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost to Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <RenderHtml html={company.cost_to_company} />
              </CardContent>
            </Card>
          )}
        </div>

        {company.job_description && company.job_description !== "<p><br></p>" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <RenderHtml html={company.job_description} />
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-muted-foreground p-2 border-b border-border sticky left-0 bg-card">
                      Program
                    </th>
                    {DEPARTMENTS.map((dept) => (
                      <th key={dept} className="text-center font-medium text-muted-foreground p-2 border-b border-border min-w-[50px]">
                        {dept}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROGRAMS.map((program) => (
                    <tr key={program} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="font-medium p-2 sticky left-0 bg-card">
                        {program}
                      </td>
                      {DEPARTMENTS.map((dept) => {
                        const eligible = getEligibility(eligibilityMap, program, dept);
                        return (
                          <td key={`${program}-${dept}`} className="text-center p-2">
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
    </div>
  );
}
