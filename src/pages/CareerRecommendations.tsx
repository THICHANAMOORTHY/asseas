import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { campusApi } from '@/api/client';
import { runModelInference } from '@/api/modelEngine';
import { StudentRecord, PredictionResponse } from '@/api/types';
import { CareerAdvisorChatbot } from '@/components/chat/CareerAdvisorChatbot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Target,
  Code,
  BookOpen,
  Briefcase,
  Award,
  MessageSquare,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CareerRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isStudent } = useAuthRole();

  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'interviews' | 'aptitude'>('all');

  const studentId = isStudent ? currentUser.studentId || '720523106032' : '720523106032';

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        let found = await campusApi.getStudentById(studentId);
        if (!found) {
          found = await campusApi.getStudentById('720523106032');
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
    loadData();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (isLoading || !student || !prediction) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-24 bg-[#E8E5F5] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-[#E8E5F5] rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-[#E8E5F5] rounded-2xl" />
        </div>
      </div>
    );
  }

  // 7 Prioritized Recommendation Areas
  const RECOMMENDATION_TRACKS = [
    {
      id: 'dsa',
      category: 'technical',
      title: '1. Programming & Data Structures (DSA) Sprint',
      icon: <Code className="h-4 w-4 text-[#29136F]" />,
      urgency: student.programming_score < 70 ? 'High Priority' : 'Maintenance',
      urgencyColor: student.programming_score < 70 ? 'danger' : 'success',
      description: `Current score: ${student.programming_score}/100. Target minimum 75+ for Tier-1/Tier-2 product engineering recruitment drives.`,
      actionItems: [
        'Complete 45 LeetCode / GFG Medium problems focused on Arrays, HashMaps, and Two Pointers.',
        'Implement fundamental Data Structures (Stacks, Queues, Binary Trees) in your primary language.',
        'Practice timed coding assessments (90 mins, 3 questions) on HackerRank.',
      ],
      timeframe: 'Weeks 1 – 4',
    },
    {
      id: 'projects',
      category: 'technical',
      title: '2. Capstone Project & Production Resume',
      icon: <Briefcase className="h-4 w-4 text-[#29136F]" />,
      urgency: student.projects < 2 ? 'High Priority' : 'Moderate',
      urgencyColor: student.projects < 2 ? 'danger' : 'warning',
      description: `Currently ${student.projects} projects logged. Recruiters screen for deployed, end-to-end full stack or core engineering solutions.`,
      actionItems: [
        `Build a full-stack, deployed system relevant to ${student.department} with live demo and GitHub README.`,
        'Highlight measurable metrics in resume: "Reduced query latency by 35%", "Engineered REST APIs handling 500+ daily requests".',
        'Upload verified source code and architectural diagram to GitHub portfolio.',
      ],
      timeframe: 'Weeks 2 – 5',
    },
    {
      id: 'aptitude',
      category: 'aptitude',
      title: '3. Quantitative & Logical Reasoning Drills',
      icon: <Target className="h-4 w-4 text-[#29136F]" />,
      urgency: student.aptitude_score < 70 ? 'High Priority' : 'Good Standing',
      urgencyColor: student.aptitude_score < 70 ? 'danger' : 'success',
      description: `Current aptitude: ${student.aptitude_score}/100. First screening elimination round for TCS, Infosys, Cognizant and Wipro.`,
      actionItems: [
        'Daily 30-minute speed-math drill: Time, Speed & Distance, Percentages, and Profit & Loss.',
        'Complete 15 sectional mock tests on IndiaBIX / PrepInsta under timed test constraints.',
        'Master Vedic math shortcuts for rapid multi-digit calculations without calculator.',
      ],
      timeframe: 'Daily Habit (30 mins/day)',
    },
    {
      id: 'interview',
      category: 'interviews',
      title: '4. Mock Interviews & The STAR Framework',
      icon: <MessageSquare className="h-4 w-4 text-[#29136F]" />,
      urgency: student.interview_score < 70 ? 'High Priority' : 'On Track',
      urgencyColor: student.interview_score < 70 ? 'danger' : 'success',
      description: `Current mock interview score: ${student.interview_score}/100. Overcome hesitation and structure behavioral answers.`,
      actionItems: [
        'Prepare 5 STAR stories: Situation, Task, Action, Result covering conflict, leadership, and technical challenges.',
        'Participate in 2 peer mock interviews scheduled through EASA Placement Cell.',
        'Record yourself explaining your favorite technical project in under 3 minutes.',
      ],
      timeframe: 'Weeks 3 – 6',
    },
    {
      id: 'tier',
      category: 'all',
      title: '5. Institutional Recruiter Tier Targeting',
      icon: <Building2 className="h-4 w-4 text-[#29136F]" />,
      urgency: 'Strategic',
      urgencyColor: 'default',
      description: `Based on your CGPA (${student.cgpa}) and zero backlogs standing, prioritize applications strategically.`,
      actionItems: [
        'Mass Recruitment (3.5 – 6.5 LPA): TCS, Cognizant, Wipro, Infosys — 100% eligibility cleared.',
        student.cgpa >= 7.0
          ? 'Dream Companies (7 – 15 LPA): Eligible for Zoho, Hexaware, Virtusa, Bosch campus drives.'
          : 'Focus on boosting aptitude score to 80+ to request CGPA relaxation in Dream rounds.',
        'Keep college placement portal documents, marksheets and resume updated 48 hrs before each drive.',
      ],
      timeframe: 'Ongoing Placement Season',
    },
    {
      id: 'softskills',
      category: 'interviews',
      title: '6. Verbal Communication & Professional Poise',
      icon: <GraduationCap className="h-4 w-4 text-[#29136F]" />,
      urgency: student.communication_score < 75 ? 'Moderate' : 'Good',
      urgencyColor: student.communication_score < 75 ? 'warning' : 'success',
      description: `Communication score: ${student.communication_score}/100. Vital for HR rounds and group discussions.`,
      actionItems: [
        'Practice Group Discussion (GD) frameworks: Categorize topics into Social, Economic, Technological, and Educational impacts.',
        'Refine formal self-introduction: Education background, technical specialization, proudest accomplishment, and career ambition.',
      ],
      timeframe: 'Weeks 4 – 7',
    },
    {
      id: 'certs',
      category: 'technical',
      title: '7. Certifications & Hackathons Portfolio',
      icon: <Award className="h-4 w-4 text-[#29136F]" />,
      urgency: student.certifications === 0 ? 'Recommended' : 'Satisfied',
      urgencyColor: student.certifications === 0 ? 'warning' : 'success',
      description: `Currently ${student.certifications} certifications and ${student.hackathon_participation} hackathon participations on file.`,
      actionItems: [
        'Obtain 1 industry-recognized certification (AWS Certified Cloud Practitioner, Azure Fundamentals, or Oracle Java).',
        'Participate in at least 1 inter-college or national hackathon (Smart India Hackathon, Unstop).',
      ],
      timeframe: 'Semester 7 Target',
    },
  ];

  const filteredTracks =
    activeTab === 'all'
      ? RECOMMENDATION_TRACKS
      : RECOMMENDATION_TRACKS.filter((t) => t.category === activeTab || t.category === 'all');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header with EASA College Theme */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#29136F] p-2 flex items-center justify-center shrink-0 shadow-sm">
            <img src="/easa_logo.png" alt="EASA College Logo" className="h-full w-full object-contain" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1745]">
                Personalized Career Recommendations
              </h1>
              <Badge className="bg-[#29136F] text-[#FFC20E] hover:bg-[#381A91] text-xs font-bold">
                EASA Placement Cell
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Strategic career tracks and live Gemini AI advisor customized to your Random Forest model (
              <strong className="text-[#29136F]">
                {Math.round(prediction.probability * 100)}% Placement Probability
              </strong>
              ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/predict', { state: { student } })}
            className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2 shadow-xs"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Run New Prediction</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column (7 Actionable Tracks) | Right Column (Interactive AI Chatbot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7 Strategic Tracks (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Track Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-[#E8E5F5] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                activeTab === 'all'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745] hover:bg-[#F7F6FC]'
              )}
            >
              All Tracks (7)
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                activeTab === 'technical'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745] hover:bg-[#F7F6FC]'
              )}
            >
              Technical & DSA
            </button>
            <button
              onClick={() => setActiveTab('aptitude')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                activeTab === 'aptitude'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745] hover:bg-[#F7F6FC]'
              )}
            >
              Aptitude & Drills
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                activeTab === 'interviews'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745] hover:bg-[#F7F6FC]'
              )}
            >
              Interviews & Poise
            </button>
          </div>

          {/* List of Tracks */}
          <div className="space-y-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="border border-[#E8E5F5] bg-white shadow-xs">
                <CardHeader className="pb-3 pt-4 px-5 border-b border-[#F7F6FC]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-[#29136F] flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#E8E5F5] flex items-center justify-center shrink-0">
                        {track.icon}
                      </div>
                      <span>{track.title}</span>
                    </CardTitle>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={track.urgencyColor === 'danger' ? 'danger' : 'success'}
                        className="text-[10px]"
                      >
                        {track.urgency}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        {track.timeframe}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    {track.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D1745] block">
                    Actionable Milestone Checklist:
                  </span>
                  <ul className="space-y-2">
                    {track.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#1D1745]/90">
                        <CheckCircle2 className="h-4 w-4 text-[#168B55] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: AI Placement Advisor Chatbot (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <CareerAdvisorChatbot student={student} prediction={prediction} />
        </div>
      </div>
    </div>
  );
};

