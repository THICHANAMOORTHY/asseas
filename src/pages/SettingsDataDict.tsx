import React from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ShieldCheck,
  Check,
  X,
  Info,
} from 'lucide-react';

export const SettingsDataDict: React.FC = () => {
  const { currentUser } = useAuthRole();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Role Governance & Methodology
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Role-based access permissions matrix and synthetic simulation governance specifications.
        </p>
      </div>

      {/* Section 1: Role-Based Access Control (RBAC) Matrix */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Role-Based Access Control (RBAC) Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Configured permission scopes across institutional roles
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-3">
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="p-2.5">Capability / Workspace View</th>
                  <th className="p-2.5 text-center">Placement Officer (Admin)</th>
                  <th className="p-2.5 text-center">Faculty / Coordinator</th>
                  <th className="p-2.5 text-center">Student Candidate</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-2.5 font-medium">Campus-Wide Analytics Dashboard</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (All Branches)</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (Dept Scoped)</td>
                  <td className="p-2.5 text-center"><X className="h-4 w-4 text-muted-foreground inline" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Student Directory & Profiles</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (All Students)</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (Dept Cohort)</td>
                  <td className="p-2.5 text-center text-muted-foreground">Own Profile Only</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">At-Risk Student Watchlist</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><X className="h-4 w-4 text-muted-foreground inline" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Log Mentoring Notes & Action Items</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center text-muted-foreground">View Assigned Only</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">What-If Prediction Studio</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (Self Simulation)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Model Diagnostics & Fairness Audit</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><X className="h-4 w-4 text-muted-foreground inline" /></td>
                  <td className="p-2.5 text-center"><X className="h-4 w-4 text-muted-foreground inline" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Generate Reports & Export CSV</td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /></td>
                  <td className="p-2.5 text-center"><Check className="h-4 w-4 text-emerald-600 inline" /> (Dept Scope)</td>
                  <td className="p-2.5 text-center text-muted-foreground">Personal PDF Dossier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Synthetic Data Methodology & Ethics Notice */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Synthetic Simulation Methodology
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
          <p>
            The CampusHire platform operates upon a verified <strong>synthetic population of 5,000 engineering student records</strong>. Parameter distributions were modeled after regional university engineering curriculum benchmarks to simulate realistic correlations between cumulative academic GPA, core technical evaluations, active arrears, and campus placement selection.
          </p>
          <div className="p-3 rounded-lg bg-secondary/40 border space-y-1">
            <strong className="text-foreground block">Key Design Constraints:</strong>
            <ul className="list-disc pl-4 space-y-1">
              <li>Protected attributes such as <strong>Gender</strong> are rigorously excluded from influencing recommendation heuristics or predictive penalties.</li>
              <li>Predictions serve as <strong>coaching heuristics</strong> to prioritize remedial tutoring and mock interview preparation, never as absolute determinants.</li>
              <li>All API endpoints conform to a standardized contract easily wired to a live FastAPI machine-learning backend.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
