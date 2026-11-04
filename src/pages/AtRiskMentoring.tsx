import React, { useState, useEffect } from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { campusApi } from '@/api/client';
import { StudentRecord, MentoringNote } from '@/api/types';
import { StudentDetailDrawer } from '@/components/student/StudentDetailDrawer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  UserCheck,
  MessageSquare,
  Search,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  UserPlus,
  Send,
} from 'lucide-react';

const MENTOR_LIST = [
  'Dr. Ramesh Sundaram',
  'Prof. Sunita Rao',
  'Dr. Arvind Mahajan',
  'Prof. Shalini Verma',
  'Dr. K. V. Narayanan',
  'Prof. Anjali Saxena',
];

export const AtRiskMentoring: React.FC = () => {
  const { currentUser, isFaculty } = useAuthRole();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>(
    isFaculty && currentUser.department ? currentUser.department : 'ALL'
  );
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Assign Mentor Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetStudentForAssign, setTargetStudentForAssign] = useState<StudentRecord | null>(null);
  const [selectedMentor, setSelectedMentor] = useState(MENTOR_LIST[0]);

  // Add Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [targetStudentForNote, setTargetStudentForNote] = useState<StudentRecord | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<MentoringNote['category']>('Academics');
  const [noteAction, setNoteAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAtRiskStudents = async () => {
    setIsLoading(true);
    try {
      const res = await campusApi.getStudents({
        riskLevel: 'AT_RISK',
        department: department as any,
        search,
        pageSize: 100,
        sortField: 'predictedProbability',
        sortOrder: 'asc', // lowest probability first!
      });
      setStudents(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRiskStudents();
  }, [department, search]);

  // Compute dynamic reason chips for why this student is at-risk
  const getReasonChips = (s: StudentRecord) => {
    const chips: { label: string; severity: 'danger' | 'warning' }[] = [];

    if (s.backlogs > 0) {
      chips.push({
        label: `${s.backlogs} Active Backlog${s.backlogs > 1 ? 's' : ''}`,
        severity: 'danger',
      });
    }
    if (s.cgpa < 6.0) {
      chips.push({
        label: `Low CGPA (${s.cgpa} < 6.0)`,
        severity: 'danger',
      });
    } else if (s.cgpa < 6.5) {
      chips.push({
        label: `Borderline CGPA (${s.cgpa})`,
        severity: 'warning',
      });
    }
    if (s.interview_score < 55) {
      chips.push({
        label: `Low Interview Score (${s.interview_score}/100)`,
        severity: 'danger',
      });
    }
    if (s.programming_score < 50) {
      chips.push({
        label: `Low Coding Score (${s.programming_score}/100)`,
        severity: 'danger',
      });
    }
    if (s.internships === 0) {
      chips.push({
        label: 'No Internships',
        severity: 'warning',
      });
    }
    if (s.attendance_percentage < 75) {
      chips.push({
        label: `Low Attendance (${s.attendance_percentage}%)`,
        severity: 'warning',
      });
    }

    return chips.slice(0, 4);
  };

  const handleConfirmAssignMentor = async () => {
    if (!targetStudentForAssign) return;
    setIsSubmitting(true);
    try {
      await campusApi.assignMentor(targetStudentForAssign.student_id, selectedMentor);
      setAssignModalOpen(false);
      setTargetStudentForAssign(null);
      fetchAtRiskStudents();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForNote || !noteText.trim()) return;

    setIsSubmitting(true);
    try {
      await campusApi.addMentoringNote(targetStudentForNote.student_id, {
        date: new Date().toISOString().split('T')[0],
        author: currentUser.name,
        authorRole: currentUser.role,
        category: noteCategory,
        note: noteText.trim(),
        actionItem: noteAction.trim() || undefined,
        status: 'In Progress',
      });
      setNoteModalOpen(false);
      setTargetStudentForNote(null);
      setNoteText('');
      setNoteAction('');
      fetchAtRiskStudents();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" /> At-Risk Cohort & Mentoring Action
            </h1>
            <Badge variant="danger" className="text-xs">
              {students.length} Under Priority Watch
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Students with model-estimated placement probability under 40%. Ranked by intervention urgency.
          </p>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search at-risk candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8 w-48 sm:w-60"
            />
          </div>

          {!isFaculty && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-xs text-foreground font-medium"
            >
              <option value="ALL">All Departments</option>
              {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">At-Risk Count</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {students.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Probability &lt; 40% threshold</p>
        </Card>

        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">With Active Backlogs</span>
            <span className="text-xs font-bold text-rose-600">Urgent</span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
            {students.filter((s) => s.backlogs > 0).length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Requires remedial arrear clearance plan</p>
        </Card>

        <Card className="p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Mentor Assigned</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {students.filter((s) => s.mentorName).length} / {students.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Department faculty allocated</p>
        </Card>
      </div>

      {/* Prioritized Student Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-secondary animate-pulse" />
          ))
        ) : students.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card text-muted-foreground">
            No at-risk students match the selected filter.
          </div>
        ) : (
          students.map((student, idx) => {
            const probPct = Math.round((student.predictedProbability ?? 0.3) * 100);
            const chips = getReasonChips(student);

            return (
              <Card
                key={student.student_id}
                className="p-4 sm:p-5 border shadow-sm hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {/* Left: Rank, ID, Name, Dept, Probability */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center shrink-0 border border-rose-500/20">
                    #{idx + 1}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{student.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">({student.student_id})</span>
                      <Badge variant="outline" className="text-[10px]">{student.department}</Badge>
                      <Badge variant="danger" className="text-[10px] font-bold tabular-nums">
                        {probPct}% Placement Odds
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>CGPA: <strong className="text-foreground">{student.cgpa}</strong></span>
                      <span>•</span>
                      <span>Interview: <strong className="text-foreground">{student.interview_score}/100</strong></span>
                      <span>•</span>
                      <span>Coding: <strong className="text-foreground">{student.programming_score}/100</strong></span>
                      <span>•</span>
                      <span>Attendance: <strong className="text-foreground">{student.attendance_percentage}%</strong></span>
                    </div>

                    {/* Reason Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {chips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            chip.severity === 'danger'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Mentor Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                  <div className="text-xs text-muted-foreground space-y-0.5 sm:text-right">
                    <div className="text-[11px]">
                      Mentor:{' '}
                      <span className="font-semibold text-foreground">
                        {student.mentorName || 'Unassigned'}
                      </span>
                    </div>
                    {student.mentorNotes && student.mentorNotes.length > 0 && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {student.mentorNotes.length} note(s) logged
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetStudentForAssign(student);
                        setSelectedMentor(student.mentorName || MENTOR_LIST[0]);
                        setAssignModalOpen(true);
                      }}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>{student.mentorName ? 'Change' : 'Assign'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetStudentForNote(student);
                        setNoteModalOpen(true);
                      }}
                      className="text-xs h-8 flex items-center gap-1 text-primary hover:text-primary"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Add Note</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setDrawerOpen(true);
                      }}
                      className="text-xs h-8 flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Profile</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Assign Mentor Dialog */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Department Mentor</DialogTitle>
            <DialogDescription>
              Assign a senior faculty member to provide academic tutoring and placement coaching to{' '}
              <strong>{targetStudentForAssign?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Select Faculty Mentor
              </label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full h-9 rounded-md border bg-background px-3 text-xs text-foreground"
              >
                {MENTOR_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={isSubmitting} onClick={handleConfirmAssignMentor}>
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Mentoring Note Dialog */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Faculty Mentoring Note</DialogTitle>
            <DialogDescription>
              Record an observation or action item for <strong>{targetStudentForNote?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmAddNote} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Counseling Category</label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className="w-full h-8 rounded border bg-background px-2"
              >
                <option value="Academics">Academics</option>
                <option value="Interview Prep">Interview Preparation</option>
                <option value="Backlog Clearance">Backlog Clearance</option>
                <option value="Skills">Coding & Skills</option>
                <option value="Motivation">General / Counseling</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Counseling Notes</label>
              <textarea
                rows={3}
                placeholder="Details of the discussion, student weaknesses, and coaching provided..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-2.5 rounded border bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Assigned Action Item</label>
              <input
                type="text"
                placeholder="e.g. Complete remedial math test by Feb 20"
                value={noteAction}
                onChange={(e) => setNoteAction(e.target.value)}
                className="w-full h-8 rounded border bg-background px-2 text-foreground"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Mentoring Note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Slide-over Detail Drawer */}
      <StudentDetailDrawer
        student={selectedStudent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNoteAdded={fetchAtRiskStudents}
      />
    </div>
  );
};

