import React, { useState, useEffect } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { useGlobalFilters } from '@/context/FilterContext';
import { campusApi } from '@/api/client';
import { AnalyticsSummary, StudentRecord } from '@/api/types';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { FilterBar } from '@/components/shared/FilterBar';
import { EthicsBanner } from '@/components/shared/EthicsBanner';
import {
  Users,
  Target,
  AlertTriangle,
  GraduationCap,
  Award,
  Sparkles,
  ArrowRight,
  Download,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  Line,
  ComposedChart,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardProps {
  onSelectStudent?: (student: StudentRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectStudent }) => {
  const { currentUser, isFaculty } = useAuthRole();
  const { department, batch, setDepartment } = useGlobalFilters();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // If faculty, sync filter department with faculty department scope
  useEffect(() => {
    if (isFaculty && currentUser.department && department !== currentUser.department) {
      setDepartment(currentUser.department);
    }
  }, [isFaculty, currentUser.department]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [sum, studRes] = await Promise.all([
          campusApi.getAnalyticsSummary({
            department: department,
            batch: batch,
          }),
          campusApi.getStudents({
            department: department,
            batch: batch,
            pageSize: 150, // sample for scatter plot
          }),
        ]);
        if (mounted) {
          setSummary(sum);
          setStudents(studRes.data);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [department, batch]);

  // Export helper for charts
  const exportChartCsv = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = "data:text/csv;charset=utf-8," +
      headers + "\n" +
      rows.map((e) => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !summary) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-secondary rounded-lg" />
          <div className="h-80 bg-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  // Scatter plot data formatted: CGPA vs Aptitude colored by outcome
  const scatterPlaced = students
    .filter((s) => s.placed === 1)
    .map((s) => ({ x: s.cgpa, y: s.aptitude_score, name: s.name, id: s.student_id, dept: s.department }));
  const scatterNotPlaced = students
    .filter((s) => s.placed === 0)
    .map((s) => ({ x: s.cgpa, y: s.aptitude_score, name: s.name, id: s.student_id, dept: s.department }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Placement Analytics Dashboard
            </h1>
            {isFaculty && (
              <Badge variant="teal" className="text-xs">
                Faculty Scope: {currentUser.department}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time cohort insights, Random Forest placement probabilities & risk indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportChartCsv('campus-kpis-summary', [summary])}
            className="text-xs flex items-center gap-1.5 h-8"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Summary CSV</span>
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar showDepartment={!isFaculty} />

      {/* Ethics Guidance Banner */}
      <EthicsBanner compact />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Cohort"
          value={summary.totalStudents}
          subtitle="Filtered students"
          icon={<Users className="h-5 w-5" />}
          infoTooltip="Total active engineering students matching active department & batch filters"
          status="default"
        />

        <KPICard
          title="Predicted Placement"
          value={`${Math.round(summary.predictedPlacementRate * 100)}%`}
          subtitle={`Historical: ${Math.round(summary.historicalPlacementRate * 100)}%`}
          trend={summary.predictedPlacementRate >= summary.historicalPlacementRate ? 'up' : 'down'}
          trendValue={summary.predictedPlacementRate >= summary.historicalPlacementRate ? '+0.6% vs target' : '-1.2%'}
          icon={<Target className="h-5 w-5" />}
          infoTooltip="Model-estimated proportion of students reaching >= 50% probability threshold"
          status="primary"
        />

        <KPICard
          title="At-Risk Students"
          value={summary.atRiskCount}
          subtitle="Probability < 40%"
          trend="down"
          trendValue="Requires Priority Coaching"
          icon={<AlertTriangle className="h-5 w-5" />}
          infoTooltip="Students identified with low placement odds due to active backlogs, low interview or programming scores"
          status="warning"
        />

        <KPICard
          title="Average CGPA"
          value={summary.averageCgpa.toFixed(2)}
          subtitle="Target threshold: 7.00"
          benchmark="Scale: 0 – 10.0"
          icon={<GraduationCap className="h-5 w-5" />}
          infoTooltip="Mean cumulative grade point average of the active cohort"
          status="default"
        />

        <KPICard
          title="Model Accuracy"
          value={`${(summary.modelAccuracy * 100).toFixed(1)}%`}
          subtitle="ROC-AUC: 0.924"
          benchmark="Random Forest v2.4"
          icon={<Award className="h-5 w-5" />}
          infoTooltip="Model validation performance: Accuracy 0.848, F1-Score 0.866, AUC 0.924"
          status="success"
        />
      </div>

      {/* Row 1: Placement Rate by Department & CGPA vs Aptitude Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Rate by Department (Bar) */}
        <ChartCard
          title="Placement Rate by Department"
          subtitle="Actual cohort placement rate vs institutional benchmark"
          infoTooltip="Compares placement outcome across engineering branches against target benchmarks."
          onExportCsv={() => exportChartCsv('placement-by-department', summary.placementByDepartment)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.placementByDepartment}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                unit="%"
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />
              <RechartsTooltip
                formatter={(val: any, name: string) => [
                  `${Math.round(Number(val) * (Number(val) <= 1 ? 100 : 1))}%`,
                  name === 'rate' ? 'Actual Placement Rate' : 'Target Benchmark',
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                name="Actual Rate"
                dataKey={(d) => Math.round(d.rate * 100)}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Target Benchmark"
                dataKey={(d) => Math.round(d.benchmarkRate * 100)}
                fill="hsl(var(--muted-foreground) / 0.35)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* CGPA vs Aptitude Scatter coloured by outcome */}
        <ChartCard
          title="CGPA vs. Aptitude Score Distribution"
          subtitle="Scatter matrix coloured by placement outcome (Placed vs In-Process)"
          infoTooltip="Visualizes individual students. Placed (Emerald) tend to cluster above CGPA 6.5 and Aptitude 60+."
          onExportCsv={() => exportChartCsv('cgpa-vs-aptitude', students.map(s => ({
            id: s.student_id, name: s.name, cgpa: s.cgpa, aptitude: s.aptitude_score, placed: s.placed
          })))}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                name="CGPA"
                domain={[4.5, 10]}
                unit=""
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                label={{ value: 'CGPA (0 - 10)', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Aptitude"
                domain={[30, 100]}
                unit=""
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                label={{ value: 'Aptitude Score (0 - 100)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ZAxis range={[30, 30]} />
              <RechartsTooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(val: any, name: string) => [val, name]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Scatter name="Placed Students" data={scatterPlaced} fill="#10b981" fillOpacity={0.75} />
              <Scatter name="Not Placed / In Process" data={scatterNotPlaced} fill="#f43f5e" fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Score Distributions (Histograms) & Backlog Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distributions (Histogram) */}
        <ChartCard
          title="Student Score Distributions"
          subtitle="Binned assessment performance across cohorts"
          infoTooltip="Distribution of students across score buckets for Aptitude, Core Technical, and Programming assessments."
          onExportCsv={() => exportChartCsv('score-distributions', summary.scoreDistributions)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.scoreDistributions}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar name="Coding / DSA" dataKey="programmingCount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              <Bar name="Technical Core" dataKey="technicalCount" fill="#0d9488" radius={[3, 3, 0, 0]} />
              <Bar name="Aptitude" dataKey="aptitudeCount" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Backlog Impact Chart */}
        <ChartCard
          title="Backlog Impact on Placement Rate"
          subtitle="Arrear count vs historical placement conversion percentage"
          infoTooltip="Zero backlogs yields a 76% placement rate, falling to 16% with 2 backlogs and 5% with 3+ backlogs."
          onExportCsv={() => exportChartCsv('backlog-impact', summary.backlogImpact)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={summary.backlogImpact}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="backlogs" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                unit="%"
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <RechartsTooltip
                formatter={(val: any, name: string) => [
                  name === 'placedRate' ? `${Math.round(Number(val) * 100)}%` : val,
                  name === 'placedRate' ? 'Placement Rate' : 'Student Count',
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                name="Student Count"
                dataKey="total"
                fill="hsl(var(--muted-foreground) / 0.25)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                name="Placement Rate"
                type="monotone"
                dataKey={(d) => Math.round(d.placedRate * 100)}
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 5, fill: '#f43f5e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Placement Funnel */}
      <ChartCard
        title="Campus Placement Conversion Funnel"
        subtitle="Tracking student attrition across criteria eligibility, assessment shortlists and final job offers"
        infoTooltip="Identifies drop-offs between criteria eligibility (CGPA >= 6, Backlogs <= 1), assessment cutoffs, and final placements."
        minHeight="h-[260px]"
        onExportCsv={() => exportChartCsv('placement-funnel', summary.placementFunnel)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-3">
          {summary.placementFunnel.map((stage, idx) => (
            <div
              key={stage.stage}
              className="p-4 rounded-xl border bg-card relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary uppercase text-[10px]">
                    Step {idx + 1}
                  </span>
                  <span className="font-bold text-foreground tabular-nums">
                    {stage.percentage}% of cohort
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">{stage.stage}</h4>
              </div>

              <div className="mt-4 pt-3 border-t flex items-baseline justify-between">
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {stage.count}
                </span>
                <span className="text-xs text-muted-foreground">students</span>
              </div>

              {/* Funnel progress bar */}
              <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-700"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

