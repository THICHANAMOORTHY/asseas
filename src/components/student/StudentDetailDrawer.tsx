import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentRecord, MentoringNote } from '@/api/types';
import { runModelInference } from '@/api/modelEngine';
import { campusApi } from '@/api/client';
import {
  X,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
  Briefcase,
  Layers,
  Calendar,
  MessageSquare,
  Plus,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReadinessGauge } from './ReadinessGauge';
import { FactorWaterfall } from './FactorWaterfall';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface StudentDetailDrawerProps {
  student: StudentRecord | null;
  open: boolean;
  onClose: () => void;
  onNoteAdded?: () => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  student,
  open,
  onClose,
  onNoteAdded,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'timeline' | 'mentoring'>('overview');

  // Mentoring note input state
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<MentoringNote['category']>('Academics');
  const [actionItem, setActionItem] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (!open || !student) return null;

  // Run model inference to get latest top factors and suggestions
  const prediction = runModelInference({
    department: student.department,
    gender: student.gender,
    cgpa: student.cgpa,
    tenth_percentage: student.tenth_percentage,
    twelfth_percentage: student.twelfth_percentage,
    aptitude_score: student.aptitude_score,
    technical_score: student.technical_score,
    communication_score: student.communication_score,
    programming_score: student.programming_score,
    internships: student.internships,
    projects: student.projects,
    certifications: student.certifications,
    hackathon_participation: student.hackathon_participation,
    backlogs: student.backlogs,
    attendance_percentage: student.attendance_percentage,
    interview_score: student.interview_score,
    extracurricular_activities: student.extracurricular_activities,
  });

  // Radar data for 5 core competencies
  const radarData = [
    { subject: 'Aptitude', score: student.aptitude_score, fullMark: 100 },
    { subject: 'Core Tech', score: student.technical_score, fullMark: 100 },
    { subject: 'Coding/DSA', score: student.programming_score, fullMark: 100 },
    { subject: 'Communication', score: student.communication_score, fullMark: 100 },
    { subject: 'Interview Prep', score: student.interview_score, fullMark: 100 },
  ];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await campusApi.addMentoringNote(student.student_id, {
        date: new Date().toISOString().split('T')[0],
        author: 'Current User',
        authorRole: 'Counselor',
        category: noteCategory,
        note: noteText.trim(),
        actionItem: actionItem.trim() || undefined,
        status: 'In Progress',
      });
      setNoteText('');
      setActionItem('');
      if (onNoteAdded) onNoteAdded();
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleOpenStudio = () => {
    onClose();
    // Navigate with student state for What-If sandbox
    navigate('/predict', { state: { student } });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in-0"
      />

      {/* Slide-over panel */}
      <aside className="relative w-full max-w-2xl bg-card border-l shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
                <Badge variant={student.placed === 1 ? 'success' : 'secondary'} className="text-[10px]">
                  {student.placed === 1 ? 'Placed' : 'In Process'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono">{student.student_id}</span>
                <span>•</span>
                <span className="font-medium text-foreground">{student.department}</span>
                <span>•</span>
                <span>Batch {student.batch}</span>
                <span>•</span>
                <span>{student.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenStudio}
              className="text-xs flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate What-If</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b bg-card">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="bg-transparent h-11 p-0 space-x-6 border-b-0">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 text-xs"
              >
                Prediction & Factors
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 text-xs"
              >
                Skills Radar
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 text-xs"
              >
                Academic Path
              </TabsTrigger>
              <TabsTrigger
                value="mentoring"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 text-xs flex items-center gap-1.5"
              >
                <span>Mentoring Notes</span>
                {student.mentorNotes && student.mentorNotes.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {student.mentorNotes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Prediction Hero Card */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-card via-card to-secondary/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Random Forest Probability
                  </span>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-3xl font-extrabold text-foreground tabular-nums">
                      {Math.round(prediction.probability * 100)}%
                    </span>
                    <Badge variant={prediction.label === 'Placed' ? 'success' : 'danger'} className="text-xs">
                      {prediction.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Model Confidence: <strong>{prediction.confidence_band}</strong> • Readiness Index: <strong>{prediction.readiness_score}/100</strong>
                  </p>
                </div>

                <div className="shrink-0">
                  <ReadinessGauge
                    score={prediction.probability * 100}
                    size={110}
                    strokeWidth={10}
                    showText={false}
                  />
                </div>
              </div>

              {/* Key Academics Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-lg border bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">CGPA</div>
                  <div className="text-base font-bold tabular-nums text-foreground">{student.cgpa}</div>
                </div>
                <div className="p-2.5 rounded-lg border bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Backlogs</div>
                  <div className={`text-base font-bold tabular-nums ${student.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {student.backlogs}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Internships</div>
                  <div className="text-base font-bold tabular-nums text-foreground">{student.internships}</div>
                </div>
                <div className="p-2.5 rounded-lg border bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Attendance</div>
                  <div className="text-base font-bold tabular-nums text-foreground">{student.attendance_percentage}%</div>
                </div>
              </div>

              {/* SHAP Factor Bars */}
              <div className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  What Drove This Prediction? (SHAP Feature Contributions)
                </h4>
                <FactorWaterfall factors={prediction.top_factors} />
              </div>

              {/* Actionable Improvement Plan */}
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Recommended Improvement Plan
                </h4>
                <ul className="space-y-2">
                  {prediction.suggestions.map((sug: any, idx) => {
                    const text = typeof sug === 'string'
                      ? sug
                      : (sug?.reason ? `${sug.skill ? `[${sug.skill}] ` : ''}${sug.reason}` : (sug?.skill || JSON.stringify(sug)));
                    return (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                        <span className="h-4 w-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                  Comprehensive Skills Pentagon (Out of 100)
                </h4>
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
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <span className="text-muted-foreground">Technical Assessment:</span>
                  <div className="text-lg font-bold tabular-nums text-foreground">{student.technical_score}/100</div>
                  <p className="text-[11px] text-muted-foreground">Core discipline engineering fundamentals</p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <span className="text-muted-foreground">Programming / DSA:</span>
                  <div className="text-lg font-bold tabular-nums text-foreground">{student.programming_score}/100</div>
                  <p className="text-[11px] text-muted-foreground">Data structures, coding speed & accuracy</p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <span className="text-muted-foreground">Mock Interview Score:</span>
                  <div className="text-lg font-bold tabular-nums text-foreground">{student.interview_score}/100</div>
                  <p className="text-[11px] text-muted-foreground">Communication, poise & technical explanation</p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <span className="text-muted-foreground">Quantitative Aptitude:</span>
                  <div className="text-lg font-bold tabular-nums text-foreground">{student.aptitude_score}/100</div>
                  <p className="text-[11px] text-muted-foreground">Analytical reasoning & numerical tests</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-card shadow-sm space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic Milestones & History
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Current Standing: Semester 7 (AY 2024–25)</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cumulative CGPA: <strong>{student.cgpa}</strong> • Active Arrears: <strong className={student.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'}>{student.backlogs}</strong>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Class Attendance: {student.attendance_percentage}%</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-muted-foreground border-2 border-background" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Practical Experience & Projects</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {student.internships} verified internship(s) • {student.projects} capstone project(s)
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {student.certifications} professional certification(s) • {student.hackathon_participation} hackathon(s)
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-muted-foreground border-2 border-background" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Higher Secondary (Class 12 / Diploma)</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Aggregate Score: <strong>{student.twelfth_percentage}%</strong>
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-muted-foreground border-2 border-background" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Secondary Schooling (Class 10)</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Board Examination: <strong>{student.tenth_percentage}%</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mentoring' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-3.5 rounded-xl border bg-secondary/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> Add Faculty Mentoring Note
                  </span>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="text-xs border rounded px-2 py-0.5 bg-background text-foreground"
                  >
                    <option value="Academics">Academics</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="Backlog Clearance">Backlog Clearance</option>
                    <option value="Skills">Skills Training</option>
                    <option value="Motivation">General / Counseling</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder="Record counseling feedback or observation..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />

                <input
                  type="text"
                  placeholder="Action item / Deliverable (optional e.g. Complete 2 mock interviews)"
                  value={actionItem}
                  onChange={(e) => setActionItem(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isSubmittingNote} className="h-7 text-xs flex items-center gap-1.5">
                    <Send className="h-3 w-3" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Post Note'}</span>
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mentoring Log ({student.mentorNotes?.length || 0})
                </h4>

                {(!student.mentorNotes || student.mentorNotes.length === 0) ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg">
                    No mentoring notes recorded for this student yet.
                  </div>
                ) : (
                  student.mentorNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg border bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{note.author}</span>
                          <span className="text-[10px] text-muted-foreground">({note.authorRole})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] py-0">{note.category}</Badge>
                          <span className="text-[10px] text-muted-foreground">{note.date}</span>
                        </div>
                      </div>

                      <p className="text-foreground/90">{note.note}</p>

                      {note.actionItem && (
                        <div className="p-2 rounded bg-muted text-[11px] flex items-start gap-1.5 border">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Action:</span> {note.actionItem}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Assigned Mentor: <strong>{student.mentorName || 'Unassigned'}</strong></span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Done
          </Button>
        </div>
      </aside>
    </div>
  );
};

