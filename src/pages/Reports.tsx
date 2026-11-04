import React, { useState } from 'react';
import { Department } from '@/api/types';
import { campusApi } from '@/api/client';
import { useAuthRole } from '@/context/AuthRoleContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Clock,
  Send,
  Sliders,
  CheckCircle2,
  Bookmark,
  Play,
  Settings2,
  Building2,
  GraduationCap,
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string;
  lastRun: string;
  status: 'Active' | 'Paused';
}

export const Reports: React.FC = () => {
  const { isFaculty, currentUser } = useAuthRole();

  // Report generation state
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>(
    isFaculty && currentUser.department ? currentUser.department : 'ALL'
  );
  const [selectedBatch, setSelectedBatch] = useState<string>('2025');
  const [includeAtRisk, setIncludeAtRisk] = useState(true);
  const [includeSkills, setIncludeSkills] = useState(true);

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scheduled reports state
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'REP-01',
      name: 'Executive Placement & Conversion Digest',
      frequency: 'Weekly',
      recipients: 'placement.director@campus.edu, deans@campus.edu',
      lastRun: '2025-01-20 09:00',
      status: 'Active',
    },
    {
      id: 'REP-02',
      name: 'Department At-Risk Intervention Roster',
      frequency: 'Weekly',
      recipients: 'hods-all@campus.edu, mentors@campus.edu',
      lastRun: '2025-01-19 18:30',
      status: 'Active',
    },
    {
      id: 'REP-03',
      name: 'Monthly Academic Arrear & Eligibility Audit',
      frequency: 'Monthly',
      recipients: 'registrar@campus.edu, controller@campus.edu',
      lastRun: '2025-01-01 00:00',
      status: 'Paused',
    },
  ]);

  const [savedFilters] = useState([
    { id: '1', name: 'CSE / IT High-Performers (CGPA > 8.0, 0 Backlogs)', count: '64 students' },
    { id: '2', name: 'At-Risk Watchlist (Prob < 40%, 1+ Backlogs)', count: '38 students' },
    { id: '3', name: 'Eligible But Unplaced Final Year (AY 24-25)', count: '72 students' },
    { id: '4', name: 'ECE Core Assessment Top Scorers', count: '41 students' },
  ]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsGenerating(false);
    setPreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleReportStatus = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Reports & Export Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Generate formal department placement reports, manage scheduled dispatches, and access saved filters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Report Builder & Saved Filters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Custom Report Builder Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Generate Department Placement Dossier
              </CardTitle>
              <CardDescription className="text-xs">
                Configure parameters for an official institutional placement & readiness audit
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Target Department</label>
                  <select
                    value={selectedDept}
                    disabled={isFaculty}
                    onChange={(e) => setSelectedDept(e.target.value as any)}
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground"
                  >
                    <option value="ALL">All Departments (Comprehensive)</option>
                    {(['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as Department[]).map((d) => (
                      <option key={d} value={d}>{d} Engineering</option>
                    ))}
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Graduating Batch</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground"
                  >
                    <option value="2025">Class of 2025 (AY 2024–25)</option>
                    <option value="2024">Class of 2024 (AY 2023–24)</option>
                  </select>
                </div>
              </div>

              {/* Sections to Include */}
              <div className="space-y-2 pt-2 border-t text-xs">
                <span className="font-semibold text-muted-foreground block">Sections to Include</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAtRisk}
                      onChange={(e) => setIncludeAtRisk(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span>At-Risk Student Remedial Roster</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSkills}
                      onChange={(e) => setIncludeSkills(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span>Assessment & Skills Distribution</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-2 px-5 h-9"
                >
                  {isGenerating ? (
                    <span>Compiling Report...</span>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Generate & Preview Report</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Filter Presets */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" /> Saved Cohort Filter Presets
              </CardTitle>
              <CardDescription className="text-xs">
                Quick-access configurations for frequent recruitment committee queries
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-2.5">
              {savedFilters.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">{f.name}</span>
                      <span className="text-muted-foreground ml-2">({f.count})</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                    Apply Filter
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scheduled Automated Reports (Mock) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Scheduled Reports (Mock Dispatch)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Automated background email & PDF digests
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  CRON Managed
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-lg border bg-card space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-foreground block">{report.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Frequency: <strong>{report.frequency}</strong> • Last: {report.lastRun}
                      </span>
                    </div>
                    <Badge
                      variant={report.status === 'Active' ? 'success' : 'secondary'}
                      className="text-[10px]"
                    >
                      {report.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground truncate">
                    Recipients: {report.recipients}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReportStatus(report.id)}
                      className="h-6 text-[11px]"
                    >
                      {report.status === 'Active' ? 'Pause Schedule' : 'Resume Schedule'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Triggered manual generation for ${report.name}`)}
                      className="h-6 text-[11px] flex items-center gap-1"
                    >
                      <Play className="h-2.5 w-2.5" /> Run Now
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Preview Modal (Print-ready) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg">
                  Placement & Candidate Readiness Audit Report
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Academic Year 2024–25 • Department: {selectedDept} • Batch: Class of {selectedBatch}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Report Body Printable Document */}
          <div className="space-y-6 py-4 text-xs text-foreground" id="printable-report">
            {/* Institution Header */}
            <div className="p-4 rounded-xl border bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Campus Placement & Career Development Cell
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Office of Career Services & Institutional Analytics
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground font-mono">
                <div>Document ID: CH-REP-2025-084</div>
                <div>Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Executive Summary Metrics */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                1. Executive Cohort Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Total Cohort</div>
                  <div className="text-lg font-bold">360 Students</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Predicted Placement Rate</div>
                  <div className="text-lg font-bold text-emerald-600">58.6%</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">At-Risk Watchlist</div>
                  <div className="text-lg font-bold text-rose-600">74 Students</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground">Average CGPA</div>
                  <div className="text-lg font-bold">7.28 / 10.0</div>
                </div>
              </div>
            </div>

            {/* Department Benchmark Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                2. Branch Conversion & Eligibility Comparison
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="p-2.5">Branch</th>
                      <th className="p-2.5">Cohort Count</th>
                      <th className="p-2.5">Avg CGPA</th>
                      <th className="p-2.5">Zero Backlogs (%)</th>
                      <th className="p-2.5">Predicted Placement Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-2.5 font-semibold">CSE</td>
                      <td className="p-2.5">115</td>
                      <td className="p-2.5">7.62</td>
                      <td className="p-2.5">88%</td>
                      <td className="p-2.5 font-bold text-emerald-600">66.0%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">IT</td>
                      <td className="p-2.5">85</td>
                      <td className="p-2.5">7.55</td>
                      <td className="p-2.5">86%</td>
                      <td className="p-2.5 font-bold text-emerald-600">65.1%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">ECE</td>
                      <td className="p-2.5">110</td>
                      <td className="p-2.5">7.32</td>
                      <td className="p-2.5">82%</td>
                      <td className="p-2.5 font-bold text-emerald-600">60.0%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">EEE</td>
                      <td className="p-2.5">65</td>
                      <td className="p-2.5">7.10</td>
                      <td className="p-2.5">78%</td>
                      <td className="p-2.5 font-bold">53.1%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">MECH</td>
                      <td className="p-2.5">75</td>
                      <td className="p-2.5">6.98</td>
                      <td className="p-2.5">74%</td>
                      <td className="p-2.5 font-bold">50.9%</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">CIVIL</td>
                      <td className="p-2.5">50</td>
                      <td className="p-2.5">6.85</td>
                      <td className="p-2.5">71%</td>
                      <td className="p-2.5 font-bold">46.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Synthetic Data Notice */}
            <div className="p-3 rounded-lg border bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px]">
              <strong>Note:</strong> All figures and student predictions in this report are generated using synthetic simulation data from a 5,000 engineering student dataset for training and planning.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

