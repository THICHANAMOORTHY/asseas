import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { campusApi } from '@/api/client';
import { runModelInference } from '@/api/modelEngine';
import { StudentRecord, PredictionResponse } from '@/api/types';
import { ReadinessGauge } from '@/components/student/ReadinessGauge';
import { FactorWaterfall } from '@/components/student/FactorWaterfall';
import { EthicsBanner } from '@/components/shared/EthicsBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Code,
  FileCheck,
  User,
  ShieldCheck,
  Layers,
  Activity,
  Check,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, isStudent } = useAuthRole();

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Target student id is either the route param /students/:id or current student's id
  const targetId = id || (isStudent ? currentUser.studentId || 'CH-2025-0001' : 'CH-2025-0001');

  useEffect(() => {
    let mounted = true;
    async function loadStudent() {
      setIsLoading(true);
      try {
        let found = await campusApi.getStudentById(targetId);
        if (!found) {
          found = await campusApi.getStudentById('CH-2025-0001');
        }
        if (mounted && found) {
          setStudent(found);
          const pred = runModelInference({
            department: found.department,
            gender: found.gender,
            cgpa: found.cgpa,
            tenth_percentage: found.tenth_percentage,
            twelfth_percentage: found.twelfth_percentage,
            aptitude_score: found.aptitude_score,
            technical_score: found.technical_score,
            communication_score: found.communication_score,
            programming_score: found.programming_score,
            internships: found.internships,
            projects: found.projects,
            certifications: found.certifications,
            hackathon_participation: found.hackathon_participation,
            backlogs: found.backlogs,
            attendance_percentage: found.attendance_percentage,
            interview_score: found.interview_score,
            extracurricular_activities: found.extracurricular_activities,
          });
          setPrediction(pred);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadStudent();
    return () => { mounted = false; };
  }, [targetId]);

  if (isLoading || !student || !prediction) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-20 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  // Radar data for skills
  const radarData = [
    { subject: 'Aptitude', score: student.aptitude_score, fullMark: 100 },
    { subject: 'Technical Core', score: student.technical_score, fullMark: 100 },
    { subject: 'Coding / DSA', score: student.programming_score, fullMark: 100 },
    { subject: 'Communication', score: student.communication_score, fullMark: 100 },
    { subject: 'Interview Prep', score: student.interview_score, fullMark: 100 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header with EASA College Theme */}
      <div className="p-6 rounded-2xl border border-[#E8E5F5] bg-white shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#29136F] p-1.5 flex items-center justify-center shrink-0 shadow-sm border border-[#E8E5F5]">
            <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#29136F]">
              EASA College of Engineering and Technology • Coimbatore
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1745]">
                Welcome, {student.name}!
              </h1>
              <Badge variant={student.placed === 1 ? 'success' : 'secondary'} className="text-xs">
                {student.placed === 1 ? 'Placed Candidate' : 'Active Placement Candidate'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono font-bold text-[#1D1745]">{student.student_id}</span>
              <span>•</span>
              <span className="font-semibold text-[#29136F]">{student.department} Engineering</span>
              <span>•</span>
              <span>Class of {student.batch}</span>
              <span>•</span>
              <span>Placement Mentor: {student.mentorName || 'Prof. K. Sundaram'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/recommendations')}
            className="bg-[#29136F] text-white hover:bg-[#381A91] font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-[#FFC20E]" />
            <span>AI Career Advisor</span>
          </Button>

          <Button
            onClick={() => navigate('/predict', { state: { student } })}
            className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run New Prediction</span>
          </Button>
        </div>
      </div>

      <EthicsBanner compact />

      {/* Row 1: Readiness & Probability Gauge | Key Academic Metrics | SHAP Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Prediction Card */}
        <Card className="border shadow-sm flex flex-col justify-between h-full">
          <CardHeader className="pb-3 border-b bg-muted/15">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Placement Probability</span>
                </CardTitle>
                <CardDescription className="text-xs">Random Forest estimate for campus drives</CardDescription>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={prediction.label === 'Placed' ? 'success' : 'danger'} className="text-[10px] font-bold">
                  {prediction.label}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 flex flex-col items-center justify-between flex-1 pb-5 space-y-4">
            {/* Semicircle Gauge with Breathing Room */}
            <div className="w-full flex justify-center py-1">
              <ReadinessGauge
                score={prediction.probability * 100}
                confidenceBand={prediction.confidence_band}
                confidenceInterval={prediction.confidence_interval}
                placementTier={prediction.placement_tier}
                size={200}
                strokeWidth={12}
                label="Estimated Placement Probability"
              />
            </div>

            {/* Overall Career Readiness Bar Widget */}
            <div className="w-full space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Career Readiness Score
                </span>
                <span className="font-mono font-bold text-foreground text-xs">
                  {prediction.readiness_score ?? 65}/100
                </span>
              </div>

              {/* Segmented Tier Track */}
              <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden flex">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    (prediction.readiness_score ?? 65) >= 75
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : (prediction.readiness_score ?? 65) >= 50
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-rose-500 to-red-400"
                  )}
                  style={{ width: `${Math.min(100, Math.max(8, prediction.readiness_score ?? 65))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>0 (At Risk)</span>
                <span>50 (Moderate)</span>
                <span>100 (Optimal)</span>
              </div>
            </div>

            {/* Quick Link to Prediction Studio */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/predict', { state: { student } })}
              className="w-full text-xs flex items-center justify-center gap-1.5 h-8 border-dashed hover:border-primary hover:text-primary transition-colors"
            >
              <span>Test What-If Levers in Studio</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Academic Baseline Card */}
        <Card className="border shadow-sm flex flex-col justify-between h-full">
          <CardHeader className="pb-3 border-b bg-muted/15">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>Academic Baseline</span>
                </CardTitle>
                <CardDescription className="text-xs">Grade standing & screening cutoffs</CardDescription>
              </div>

              <Badge
                variant={student.backlogs === 0 && student.attendance_percentage >= 75 ? 'success' : 'danger'}
                className="text-[10px] shrink-0"
              >
                {student.backlogs === 0 && student.attendance_percentage >= 75 ? 'Drive Cleared' : 'Criteria Alert'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-3 pb-5 flex flex-col justify-between flex-1 space-y-2.5">
            {/* Cumulative CGPA */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> Cumulative CGPA
                </span>
                <span className="font-mono font-bold text-foreground text-xs">{student.cgpa} / 10.0</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      student.cgpa >= 7.5 ? "bg-emerald-500" : student.cgpa >= 6.5 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${Math.min(100, (student.cgpa / 10) * 100)}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                  student.cgpa >= 7.5
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : student.cgpa >= 6.5
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                )}>
                  {student.cgpa >= 7.5 ? 'Tier 1 Cutoff (≥7.5)' : student.cgpa >= 6.5 ? 'Tier 2 Cutoff (≥6.5)' : '<6.5 High Risk'}
                </span>
              </div>
            </div>

            {/* Active Arrears / Backlogs */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                {student.backlogs === 0 ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                )}
                Active Arrears / Backlogs
              </span>
              <Badge variant={student.backlogs === 0 ? 'success' : 'danger'} className="text-[10px]">
                {student.backlogs === 0 ? 'Zero Backlogs' : `${student.backlogs} Active Backlog(s)`}
              </Badge>
            </div>

            {/* High School Board Aggregates */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <FileCheck className="h-3.5 w-3.5 text-indigo-500" /> Board Aggregates (10th & 12th)
                </span>
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider",
                  student.tenth_percentage >= 60 && student.twelfth_percentage >= 60
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                )}>
                  {student.tenth_percentage >= 60 && student.twelfth_percentage >= 60 ? '≥60% Baseline Met' : '<60% Filter Risk'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-foreground font-mono">
                <span>Class 10th: <strong>{student.tenth_percentage}%</strong></span>
                <span>Class 12th: <strong>{student.twelfth_percentage}%</strong></span>
              </div>
            </div>

            {/* Classroom Attendance */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" /> Classroom Attendance
                </span>
                <span className="font-mono font-bold text-foreground text-xs">{student.attendance_percentage}%</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      student.attendance_percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                    )}
                    style={{ width: `${Math.min(100, student.attendance_percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {student.attendance_percentage >= 75 ? 'Cleared (≥75%)' : 'Condonation Alert'}
                </span>
              </div>
            </div>

            {/* Practical Portfolio Experience */}
            <div className="p-2.5 rounded-xl bg-secondary/30 border flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Briefcase className="h-3.5 w-3.5 text-teal-500" /> Practical Portfolio
              </span>
              <span className="font-medium text-foreground text-xs">
                {student.internships} internship(s) • {student.projects} project(s)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* SHAP Factor Bars Card */}
        <Card className="border shadow-sm flex flex-col justify-between h-full">
          <CardHeader className="pb-3 border-b bg-muted/15">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Primary Factor Drivers</span>
                </CardTitle>
                <CardDescription className="text-xs">SHAP contributions to this probability</CardDescription>
              </div>

              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                TreeExplainer
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-5 flex-1 flex flex-col justify-between">
            <FactorWaterfall factors={prediction.top_factors} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Skills Radar + Actionable Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skills Radar */}
        <Card className="lg:col-span-5 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">5-Point Competency Radar</CardTitle>
            <CardDescription className="text-xs">Evaluated across core assessments & mock rounds</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 9 }} />
                  <Radar
                    name="Student Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px] text-muted-foreground">
              <span>Coding / DSA: <strong className="text-foreground">{student.programming_score}/100</strong></span>
              <span>Interview Poise: <strong className="text-foreground">{student.interview_score}/100</strong></span>
              <span>Core Engineering: <strong className="text-foreground">{student.technical_score}/100</strong></span>
              <span>Quantitative: <strong className="text-foreground">{student.aptitude_score}/100</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Improvement Plan & Mentoring Notes */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border shadow-sm border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" /> Personal Placement Improvement Plan
              </CardTitle>
              <CardDescription className="text-xs">
                Targeted steps tailored to your weakest levers before company interview schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3 pb-5">
              {prediction.suggestions.map((sug: any, idx) => {
                const text = typeof sug === 'string'
                  ? sug
                  : (sug?.reason ? `${sug.skill ? `[${sug.skill}] ` : ''}${sug.reason}` : (sug?.skill || JSON.stringify(sug)));
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card border text-xs">
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-foreground font-medium leading-relaxed">{text}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Academic Path Timeline */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Academic Journey Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">Semester 7 – Placement Window</span>
                    <p className="text-muted-foreground mt-0.5">
                      CGPA {student.cgpa} • {student.internships} Internship(s) • {student.projects} Project(s)
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-muted-foreground border-2 border-background" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">Class 12 Higher Secondary</span>
                    <p className="text-muted-foreground mt-0.5">
                      Board Percentage: {student.twelfth_percentage}%
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-muted-foreground border-2 border-background" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">Class 10 Matriculation</span>
                    <p className="text-muted-foreground mt-0.5">
                      Secondary Score: {student.tenth_percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

