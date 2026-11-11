import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Department,
  Gender,
  PredictionRequest,
  PredictionResponse,
} from '@/api/types';
import { campusApi } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ReadinessGauge } from '@/components/student/ReadinessGauge';
import { FactorWaterfall } from '@/components/student/FactorWaterfall';
import { EthicsBanner } from '@/components/shared/EthicsBanner';
import { AssessmentQuizModal } from '@/components/quiz/AssessmentQuizModal';
import {
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  Code,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle2,
  XCircle,
  Pin,
  Target,
  ArrowRight,
  Layers,
  Award,
  GraduationCap,
  Plus,
  Minus,
  Check,
  Loader2,
  AlertCircle,
  Cpu,
} from 'lucide-react';

const predictionSchema = z.object({
  department: z.enum(['ECE', 'EEE', 'CSE', 'IT', 'MECH', 'CIVIL']),
  gender: z.enum(['Male', 'Female', 'Other']),
  cgpa: z.number().min(0).max(10),
  tenth_percentage: z.number().min(0).max(100),
  twelfth_percentage: z.number().min(0).max(100),
  aptitude_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  communication_score: z.number().min(0).max(100),
  programming_score: z.number().min(0).max(100),
  internships: z.number().min(0).max(10),
  projects: z.number().min(0).max(15),
  certifications: z.number().min(0).max(10),
  hackathon_participation: z.number().min(0).max(10),
  backlogs: z.number().min(0).max(10),
  attendance_percentage: z.number().min(0).max(100),
  interview_score: z.number().min(0).max(100),
  extracurricular_activities: z.number().min(0).max(10),
});

type FormValues = z.infer<typeof predictionSchema>;

const PRESET_PROFILES: Record<string, { label: string; values: FormValues }> = {
  highAchiever: {
    label: 'High-Achiever (CSE)',
    values: {
      department: 'CSE',
      gender: 'Female',
      cgpa: 8.85,
      tenth_percentage: 92,
      twelfth_percentage: 90,
      aptitude_score: 85,
      technical_score: 88,
      communication_score: 82,
      programming_score: 91,
      internships: 2,
      projects: 4,
      certifications: 3,
      hackathon_participation: 2,
      backlogs: 0,
      attendance_percentage: 89,
      interview_score: 84,
      extracurricular_activities: 3,
    },
  },
  borderline: {
    label: 'Borderline Profile (ECE)',
    values: {
      department: 'ECE',
      gender: 'Male',
      cgpa: 6.95,
      tenth_percentage: 75,
      twelfth_percentage: 72,
      aptitude_score: 64,
      technical_score: 62,
      communication_score: 68,
      programming_score: 58,
      internships: 1,
      projects: 2,
      certifications: 1,
      hackathon_participation: 0,
      backlogs: 1,
      attendance_percentage: 78,
      interview_score: 62,
      extracurricular_activities: 1,
    },
  },
  highRisk: {
    label: 'High-Risk Arrear Case (MECH)',
    values: {
      department: 'MECH',
      gender: 'Male',
      cgpa: 5.65,
      tenth_percentage: 64,
      twelfth_percentage: 60,
      aptitude_score: 48,
      technical_score: 46,
      communication_score: 52,
      programming_score: 38,
      internships: 0,
      projects: 1,
      certifications: 0,
      hackathon_participation: 0,
      backlogs: 3,
      attendance_percentage: 68,
      interview_score: 45,
      extracurricular_activities: 1,
    },
  },
};

export const PredictionStudio: React.FC = () => {
  const location = useLocation();
  const passedStudent = location.state?.student;

  const [activeTab, setActiveTab] = useState<'academics' | 'skills' | 'experience' | 'all'>('academics');
  const [isCalculating, setIsCalculating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [previousProbability, setPreviousProbability] = useState<number | null>(null);
  const [lastEvaluatedValues, setLastEvaluatedValues] = useState<FormValues | null>(null);

  // Baseline comparison state
  const [pinnedBaseline, setPinnedBaseline] = useState<PredictionResponse | null>(null);
  const [goalSeekOpen, setGoalSeekOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: passedStudent ? {
      department: passedStudent.department,
      gender: passedStudent.gender,
      cgpa: passedStudent.cgpa,
      tenth_percentage: passedStudent.tenth_percentage,
      twelfth_percentage: passedStudent.twelfth_percentage,
      aptitude_score: passedStudent.aptitude_score,
      technical_score: passedStudent.technical_score,
      communication_score: passedStudent.communication_score,
      programming_score: passedStudent.programming_score,
      internships: passedStudent.internships,
      projects: passedStudent.projects,
      certifications: passedStudent.certifications,
      hackathon_participation: passedStudent.hackathon_participation,
      backlogs: passedStudent.backlogs,
      attendance_percentage: passedStudent.attendance_percentage,
      interview_score: passedStudent.interview_score,
      extracurricular_activities: passedStudent.extracurricular_activities,
    } : PRESET_PROFILES.borderline.values,
  });

  const currentValues = watch();

  // Check if user has modified form values since the last model prediction run
  const isDirty = lastEvaluatedValues
    ? JSON.stringify(lastEvaluatedValues) !== JSON.stringify(currentValues)
    : false;

  // Execute Scikit-Learn Random Forest prediction (On-Demand)
  const executePrediction = async (values: FormValues, withSpinner = true) => {
    if (withSpinner) {
      setIsCalculating(true);
      // Realistic brief ML execution time so user sees the 50 decision trees evaluating
      await new Promise((r) => setTimeout(r, 400));
    }
    try {
      const res = await campusApi.predict(values, passedStudent?.student_id);
      if (predictionResult) {
        setPreviousProbability(predictionResult.probability);
      }
      setPredictionResult(res);
      setLastEvaluatedValues(values);
      if (!pinnedBaseline) {
        setPinnedBaseline(res);
      }
    } finally {
      if (withSpinner) setIsCalculating(false);
    }
  };

  // Initial load evaluates default profile once
  useEffect(() => {
    executePrediction(currentValues, false);
  }, []);

  const onSubmit = (data: FormValues) => {
    executePrediction(data, true);
  };

  const probDelta =
    predictionResult && previousProbability !== null
      ? Math.round((predictionResult.probability - previousProbability) * 1000) / 10
      : 0;

  const baselineDelta =
    predictionResult && pinnedBaseline
      ? Math.round((predictionResult.probability - pinnedBaseline.probability) * 1000) / 10
      : 0;

  // Apply goal-seek optimization
  const handleApplyOptimalTarget = () => {
    setValue('backlogs', 0);
    if (currentValues.programming_score < 75) setValue('programming_score', 78);
    if (currentValues.interview_score < 75) setValue('interview_score', 76);
    if (currentValues.internships === 0) setValue('internships', 1);
    setGoalSeekOpen(false);
  };

  // Apply measured scores from AI Assessment Quiz
  const handleApplyQuizScores = (measuredAptitude: number, measuredCommunication: number) => {
    setValue('aptitude_score', measuredAptitude);
    setValue('communication_score', measuredCommunication);
    executePrediction(
      {
        ...currentValues,
        aptitude_score: measuredAptitude,
        communication_score: measuredCommunication,
      },
      true
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> Placement Prediction Studio
            </h1>
            <Badge variant="teal" className="text-xs">
              What-If Sandbox
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evaluate placement probabilities, company eligibility cutoffs, and simulated student interventions.
          </p>
        </div>

        {/* ML Status & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-card text-muted-foreground shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-foreground font-bold">50 Trees</span>
            <span>Scikit-Learn Random Forest</span>
          </div>

          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border text-xs">
            <span className="text-muted-foreground px-1.5 text-[11px]">Presets:</span>
            {Object.entries(PRESET_PROFILES).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  reset(p.values);
                  executePrediction(p.values, true);
                }}
                className="px-2 py-1 rounded bg-card hover:bg-accent text-foreground text-[11px] font-medium border shadow-2xs transition-colors"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <EthicsBanner compact />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Section Navigation Tabs */}
          <div className="flex items-center justify-between p-1 bg-secondary/50 border rounded-lg text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('academics')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'academics'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1. Academics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'skills'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                2. Skills & Assessments
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'experience'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                3. Career Prep
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'all' ? 'academics' : 'all')}
              className={`text-[11px] px-2 py-1 rounded ${activeTab === 'all' ? 'text-primary font-bold' : 'text-muted-foreground'}`}
            >
              {activeTab === 'all' ? 'Tabbed View' : 'Show All'}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Section 1: Academics & Standing */}
            {(activeTab === 'academics' || activeTab === 'all') && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 pt-4 px-5 border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> Academic Standing & Eligibility
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground font-mono">Corporate Baselines</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Department & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Engineering Branch</label>
                      <Controller
                        control={control}
                        name="department"
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            {(['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as Department[]).map((d) => (
                              <option key={d} value={d}>{d} Engineering</option>
                            ))}
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Gender Identity</label>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Cumulative CGPA (Sleek card with steppers, no double numbers) */}
                  <div className="p-3.5 rounded-xl border bg-card space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          Cumulative Grade Point Average (CGPA)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {currentValues.cgpa >= 7.5 ? '🌟 Tier-1 Ready (>= 7.5)' : currentValues.cgpa >= 6.0 ? '✅ Criteria Eligible (>= 6.0)' : '⚠️ Below standard eligibility (< 6.0)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setValue('cgpa', Math.max(4.0, Math.round((currentValues.cgpa - 0.1) * 100) / 100))}
                          className="h-6 w-6 rounded border bg-secondary flex items-center justify-center hover:bg-accent text-foreground text-xs"
                          aria-label="Decrease CGPA"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold font-mono text-xs tabular-nums">
                          {currentValues.cgpa.toFixed(2)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setValue('cgpa', Math.min(10.0, Math.round((currentValues.cgpa + 0.1) * 100) / 100))}
                          className="h-6 w-6 rounded border bg-secondary flex items-center justify-center hover:bg-accent text-foreground text-xs"
                          aria-label="Increase CGPA"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <Controller
                      control={control}
                      name="cgpa"
                      render={({ field }) => (
                        <Slider
                          min={4.0}
                          max={10.0}
                          step={0.05}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>

                  {/* Active Arrears / Backlogs */}
                  <div className="p-3.5 rounded-xl border bg-card space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">Active Arrears / Backlogs</span>
                          <Badge
                            variant={currentValues.backlogs === 0 ? 'success' : 'danger'}
                            className="text-[10px] py-0 font-medium"
                          >
                            {currentValues.backlogs === 0 ? 'Zero Backlogs (Optimal)' : `${currentValues.backlogs} Active Backlog${currentValues.backlogs > 1 ? 's' : ''}`}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {currentValues.backlogs > 0 ? '⚠️ Mandatory clearance required by 82% of recruiters' : 'Satisfies all day-1 company eligibility criteria'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setValue('backlogs', Math.max(0, currentValues.backlogs - 1))}
                          className="h-6 w-6 rounded border bg-secondary flex items-center justify-center hover:bg-accent text-foreground text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 py-0.5 rounded-md bg-secondary border text-foreground font-bold font-mono text-xs tabular-nums">
                          {currentValues.backlogs}
                        </span>
                        <button
                          type="button"
                          onClick={() => setValue('backlogs', Math.min(8, currentValues.backlogs + 1))}
                          className="h-6 w-6 rounded border bg-secondary flex items-center justify-center hover:bg-accent text-foreground text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <Controller
                      control={control}
                      name="backlogs"
                      render={({ field }) => (
                        <Slider
                          min={0}
                          max={6}
                          step={1}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>

                  {/* Attendance & High School Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-lg border bg-secondary/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Class Attendance</span>
                        <span className="font-mono font-bold text-foreground text-xs">{currentValues.attendance_percentage}%</span>
                      </div>
                      <Controller
                        control={control}
                        name="attendance_percentage"
                        render={({ field }) => (
                          <Slider
                            min={50}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        )}
                      />
                    </div>

                    <div className="p-3 rounded-lg border bg-secondary/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Class 10th Board</span>
                        <span className="font-mono font-bold text-foreground text-xs">{currentValues.tenth_percentage}%</span>
                      </div>
                      <Controller
                        control={control}
                        name="tenth_percentage"
                        render={({ field }) => (
                          <Slider
                            min={50}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        )}
                      />
                    </div>

                    <div className="p-3 rounded-lg border bg-secondary/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Class 12th Board</span>
                        <span className="font-mono font-bold text-foreground text-xs">{currentValues.twelfth_percentage}%</span>
                      </div>
                      <Controller
                        control={control}
                        name="twelfth_percentage"
                        render={({ field }) => (
                          <Slider
                            min={50}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 2: Technical & Soft Skills */}
            {(activeTab === 'skills' || activeTab === 'all') && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 pt-4 px-5 border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" /> Technical & Assessment Competencies
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground font-mono">Scores: 0 – 100</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-3.5">
                  {/* Programming / DSA */}
                  <div className="p-3.5 rounded-xl border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          Programming & Data Structures (DSA)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {currentValues.programming_score >= 80 ? '🚀 High Tier-1 Readiness' : currentValues.programming_score >= 65 ? 'Competitive benchmark' : 'Requires LeetCode / HackerRank drills'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold font-mono text-xs tabular-nums">
                        {currentValues.programming_score}/100
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name="programming_score"
                      render={({ field }) => (
                        <Slider
                          min={20}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>

                  {/* Core Technical Assessment */}
                  <div className="p-3.5 rounded-xl border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          Core Technical Fundamentals
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Branch-specific subject mastery and system design
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold font-mono text-xs tabular-nums">
                        {currentValues.technical_score}/100
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name="technical_score"
                      render={({ field }) => (
                        <Slider
                          min={20}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>

                  {/* Mock Interview */}
                  <div className="p-3.5 rounded-xl border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          Mock Interview Evaluation
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Technical poise, STAR articulation, and problem breakdown
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold font-mono text-xs tabular-nums">
                        {currentValues.interview_score}/100
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name="interview_score"
                      render={({ field }) => (
                        <Slider
                          min={20}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                        />
                      )}
                    />
                  </div>

                  {/* AI Assessment Quiz Callout (Aptitude & Soft Skills) */}
                  <div className="p-4 rounded-xl border border-[#29136F]/20 bg-gradient-to-r from-[#29136F]/5 via-[#FFC20E]/10 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#29136F] dark:text-[#FFC20E] flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-[#FFC20E]" /> Measure Aptitude & Soft Skills with AI Quiz
                        </span>
                        <Badge className="bg-[#29136F] text-[#FFC20E] text-[10px] font-bold">
                          Adaptive Test
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Aptitude Score (16.9% Weight) • Soft Skills & Verbal (6.4% Weight)
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setQuizModalOpen(true)}
                      className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-8.5 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Take AI Assessment Quiz</span>
                    </Button>
                  </div>

                  {/* Aptitude & Communication */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg border bg-secondary/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Quantitative Aptitude</span>
                        <span className="font-mono font-bold text-foreground text-xs">{currentValues.aptitude_score}/100</span>
                      </div>
                      <Controller
                        control={control}
                        name="aptitude_score"
                        render={({ field }) => (
                          <Slider
                            min={20}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        )}
                      />
                    </div>

                    <div className="p-3 rounded-lg border bg-secondary/30 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Verbal & Communication</span>
                        <span className="font-mono font-bold text-foreground text-xs">{currentValues.communication_score}/100</span>
                      </div>
                      <Controller
                        control={control}
                        name="communication_score"
                        render={({ field }) => (
                          <Slider
                            min={20}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([val]) => field.onChange(val)}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 3: Career Prep & Experience */}
            {(activeTab === 'experience' || activeTab === 'all') && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-3 pt-4 px-5 border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Practical Experience & Resume Portfolio
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground font-mono">Experience Multipliers</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Internships */}
                    <div className="p-3 rounded-lg border bg-card text-center space-y-1.5">
                      <span className="text-xs font-semibold text-foreground block">Internships</span>
                      <Controller
                        control={control}
                        name="internships"
                        render={({ field }) => (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm tabular-nums w-6">{field.value}</span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(5, field.value + 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground block">verified</span>
                    </div>

                    {/* Projects */}
                    <div className="p-3 rounded-lg border bg-card text-center space-y-1.5">
                      <span className="text-xs font-semibold text-foreground block">Projects</span>
                      <Controller
                        control={control}
                        name="projects"
                        render={({ field }) => (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm tabular-nums w-6">{field.value}</span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(8, field.value + 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground block">capstones</span>
                    </div>

                    {/* Certifications */}
                    <div className="p-3 rounded-lg border bg-card text-center space-y-1.5">
                      <span className="text-xs font-semibold text-foreground block">Certifications</span>
                      <Controller
                        control={control}
                        name="certifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm tabular-nums w-6">{field.value}</span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(6, field.value + 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground block">credentials</span>
                    </div>

                    {/* Hackathons */}
                    <div className="p-3 rounded-lg border bg-card text-center space-y-1.5">
                      <span className="text-xs font-semibold text-foreground block">Hackathons</span>
                      <Controller
                        control={control}
                        name="hackathon_participation"
                        render={({ field }) => (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, field.value - 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm tabular-nums w-6">{field.value}</span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(6, field.value + 1))}
                              className="h-6 w-6 rounded border bg-secondary text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground block">participations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reset(PRESET_PROFILES.borderline.values)}
                className="text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Defaults</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGoalSeekOpen(!goalSeekOpen)}
                  className="text-xs flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>Target Goal Seek</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isCalculating}
                  className={`text-xs sm:text-sm flex items-center gap-2 px-6 h-10 font-bold shadow-md transition-all ${
                    isDirty
                      ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/50 ring-offset-1'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating 50 Decision Trees...
                    </span>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4 text-amber-300" />
                      <span>{isDirty ? 'Run Random Forest Prediction *' : 'Run Random Forest Prediction'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Goal Seek Wizard (Collapsible Helper) */}
          {goalSeekOpen && (
            <Card className="border-primary/30 bg-primary/5 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Target className="h-4 w-4" /> Placement Goal-Seek Optimization
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={handleApplyOptimalTarget}
                    className="h-7 text-xs flex items-center gap-1"
                  >
                    <span>Apply Optimal Targets</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Calculated lowest-friction steps to boost candidate placement probability past 80%:
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 pb-4 space-y-2 text-xs">
                {predictionResult?.optimal_steps?.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-card border">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-foreground">{step.action}</span>
                    </div>
                    <Badge variant="success" className="text-[10px] font-mono font-bold">
                      +{Math.round(step.expectedDelta * 100)}% Boost
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Inferences, Speedometer Gauge & Recruiter Eligibility (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <Card className="border shadow-lg overflow-hidden">
            <CardHeader className="pb-3 pt-4 px-5 border-b bg-gradient-to-r from-card to-secondary/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-primary" />
                    Kaggle Random Forest Model
                  </CardTitle>
                  <CardDescription className="text-xs">
                    50 Scikit-Learn Decision Trees (80.6% Acc, 0.882 AUC)
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="teal" className="text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ML Model
                  </Badge>
                  {pinnedBaseline && (
                    <button
                      type="button"
                      onClick={() => setPinnedBaseline(predictionResult)}
                      title="Update pinned baseline comparison point"
                      className="text-[10px] px-2 py-0.5 rounded border bg-background hover:bg-secondary text-muted-foreground"
                    >
                      Pin Baseline
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Inputs Modified Notice */}
            {isDirty && (
              <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-2.5 flex items-center justify-between gap-2 text-amber-700 dark:text-amber-400 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Inputs changed. Click button to evaluate ML model.</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isCalculating}
                  className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0"
                >
                  Run Now
                </Button>
              </div>
            )}

            <CardContent className="p-5 space-y-5">
              {isCalculating ? (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
                  <Loader2 className="h-9 w-9 text-primary animate-spin" />
                  <div className="text-sm font-bold text-foreground">Evaluating 50 Decision Trees...</div>
                  <div className="text-xs text-muted-foreground max-w-xs">
                    Traversing ensemble nodes on Kaggle placement dataset features to compute true model probability.
                  </div>
                </div>
              ) : predictionResult ? (
                <>
                  {/* Flawless Semi-Circle Gauge */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/20 border">
                    <ReadinessGauge
                      score={predictionResult.probability * 100}
                      confidenceBand={predictionResult.confidence_band}
                      confidenceInterval={predictionResult.confidence_interval}
                      placementTier={predictionResult.placement_tier}
                      delta={probDelta}
                      size={210}
                      strokeWidth={14}
                      label="Estimated Placement Probability"
                    />

                    {/* Baseline vs What-If Comparison Strip */}
                    {pinnedBaseline && (
                      <div className="mt-3 pt-3 border-t w-full flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                          <span>Pinned Baseline: </span>
                          <strong className="text-foreground">{Math.round(pinnedBaseline.probability * 100)}%</strong>
                        </div>
                        <div>
                          <span>Net Gain: </span>
                          <strong className={baselineDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {baselineDelta >= 0 ? `+${baselineDelta.toFixed(1)}%` : `${baselineDelta.toFixed(1)}%`}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Outcome Classification & Overall Readiness Score */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Predicted Outcome</div>
                      <Badge
                        variant={predictionResult.label === 'Placed' ? 'success' : 'danger'}
                        className="mt-1 text-xs px-2.5 py-0.5 font-bold"
                      >
                        {predictionResult.label}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-lg border bg-card">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Overall Readiness</div>
                      <div className="text-base font-bold tabular-nums text-foreground mt-0.5">
                        {predictionResult.readiness_score}/100
                      </div>
                    </div>
                  </div>

                  {/* Live Recruiter Tier Eligibility Checklist */}
                  {predictionResult.company_eligibility && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" /> Recruiter Tier Eligibility
                      </h4>
                      <div className="space-y-1.5">
                        {predictionResult.company_eligibility.map((tier, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                              tier.isEligible
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-secondary/30 border-border opacity-85'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground text-xs">{tier.tierName}</span>
                                <span className="text-[10px] text-muted-foreground">({tier.ctcRange})</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {tier.sampleCompanies.join(', ')}
                              </div>
                              {!tier.isEligible && tier.unmetCriteria && (
                                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                  Missing: {tier.unmetCriteria.join(' • ')}
                                </div>
                              )}
                            </div>

                            <Badge
                              variant={tier.isEligible ? 'success' : 'secondary'}
                              className="text-[10px] shrink-0"
                            >
                              {tier.isEligible ? 'Eligible' : 'Ineligible'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SHAP Factor Bars */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Factor Decomposition (SHAP TreeExplainer)
                    </h4>
                    <FactorWaterfall factors={predictionResult.top_factors} />
                  </div>

                  {/* Actionable Improvement Plan */}
                  <div className="p-3.5 rounded-xl border bg-primary/5 border-primary/20 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Priority Actions for this Candidate
                    </h4>
                    <ul className="space-y-2">
                      {predictionResult.suggestions.map((sug: any, idx) => {
                        const text = typeof sug === 'string'
                          ? sug
                          : (sug?.reason ? `${sug.skill ? `[${sug.skill}] ` : ''}${sug.reason}` : (sug?.skill || JSON.stringify(sug)));
                        return (
                          <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Adjust inputs to trigger inference calculation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* AI Assessment Quiz Modal */}
      <AssessmentQuizModal
        open={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        department={currentValues.department}
        currentAptitude={currentValues.aptitude_score}
        currentCommunication={currentValues.communication_score}
        onApplyScores={handleApplyQuizScores}
      />
    </div>
  );
};
