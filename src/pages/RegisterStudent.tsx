import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { campusApi } from '@/api/client';
import { StudentRecord, Department, Gender } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  BookOpen,
  Code,
  Briefcase,
  KeyRound,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const RegisterStudent: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthRole();

  // Form State
  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    registerNumber: '',
    email: '',
    mobileNumber: '',
    department: 'CSE' as Department,
    batch: '2025',
    gender: 'Male' as Gender,

    // Academic
    cgpa: 7.5,
    tenthPercentage: 80,
    twelfthPercentage: 78,
    currentSemester: 7,
    backlogs: 0,
    attendancePercentage: 85,

    // Technical & Competencies
    programmingScore: 72,
    aptitudeScore: 75,
    technicalScore: 70,
    communicationScore: 74,
    interviewScore: 70,
    internships: 1,
    projects: 2,
    certifications: 1,
    hackathonParticipation: 1,
    extracurricular: 1,
    placementTraining: 1,

    // Password
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate live profile completion score
  const calculateCompletion = () => {
    let score = 0;
    if (formData.fullName.trim()) score += 10;
    if (formData.registerNumber.trim()) score += 10;
    if (formData.email.trim()) score += 10;
    if (formData.mobileNumber.trim()) score += 10;
    if (formData.cgpa > 0) score += 15;
    if (formData.tenthPercentage > 0 && formData.twelfthPercentage > 0) score += 15;
    if (formData.programmingScore > 0 && formData.aptitudeScore > 0) score += 15;
    if (formData.password && formData.password === formData.confirmPassword) score += 15;
    return Math.min(100, score);
  };

  const profileCompletion = calculateCompletion();

  const handleQuickFillSample = () => {
    const regNum = `7105211040${Math.floor(10 + Math.random() * 89)}`;
    setFormData({
      fullName: 'Karthik Subramanian',
      registerNumber: regNum,
      email: `karthik.${regNum.slice(-4)}@easa.edu.in`,
      mobileNumber: '9840123456',
      department: 'CSE',
      batch: '2025',
      gender: 'Male',
      cgpa: 8.15,
      tenthPercentage: 88,
      twelfthPercentage: 84,
      currentSemester: 7,
      backlogs: 0,
      attendancePercentage: 88,
      programmingScore: 82,
      aptitudeScore: 78,
      technicalScore: 80,
      communicationScore: 84,
      interviewScore: 79,
      internships: 2,
      projects: 3,
      certifications: 2,
      hackathonParticipation: 2,
      extracurricular: 1,
      placementTraining: 1,
      password: 'password123',
      confirmPassword: 'password123',
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.registerNumber.trim()) {
      setErrorMsg('Full name and Register Number are required institutional fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMsg('Please enter a valid academic or personal email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Assemble full StudentRecord matching the 19-field placement data contract
      const newStudent: StudentRecord = {
        student_id: formData.registerNumber.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        department: formData.department,
        gender: formData.gender,
        batch: formData.batch,
        cgpa: Number(formData.cgpa),
        tenth_percentage: Number(formData.tenthPercentage),
        twelfth_percentage: Number(formData.twelfthPercentage),
        aptitude_score: Number(formData.aptitudeScore),
        technical_score: Number(formData.technicalScore),
        communication_score: Number(formData.communicationScore),
        programming_score: Number(formData.programmingScore),
        internships: Number(formData.internships),
        projects: Number(formData.projects),
        certifications: Number(formData.certifications),
        hackathon_participation: Number(formData.hackathonParticipation),
        backlogs: Number(formData.backlogs),
        attendance_percentage: Number(formData.attendancePercentage),
        interview_score: Number(formData.interviewScore),
        extracurricular_activities: Number(formData.extracurricular),
        placed: 0, // In progress candidate
        mentorName: 'Prof. K. Sundaram (EASA Placement Cell)',
      };

      // 1. Persist new student record
      const registered = await campusApi.registerStudent(newStudent);

      // 2. Set authenticated context
      setUser({
        id: registered.student_id,
        name: registered.name,
        email: registered.email,
        role: 'Student',
        studentId: registered.student_id,
        department: registered.department,
      });

      // 3. Navigate to Student Placement Dashboard
      navigate('/student-profile');
    } catch (err: any) {
      setErrorMsg(`Registration failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6FC] text-[#1D1745] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#E8E5F5] bg-white sticky top-0 z-50 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div
            onClick={() => navigate('/landing')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="h-10 w-10 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 border border-[#E8E5F5] shadow-xs">
              <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#29136F] uppercase leading-none block">
                EASA COLLEGE OF ENGINEERING AND TECHNOLOGY
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                Candidate Registration & Profile Collection Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickFillSample}
              className="text-xs h-8 px-3 border-[#29136F]/30 text-[#29136F] hover:bg-[#29136F]/5 font-semibold"
            >
              <span>⚡ Quick-Fill Sample Data</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs text-muted-foreground hover:text-[#1D1745]"
            >
              Already Registered? Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Title & Live Completion Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E5F5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1745]">
                Student Registration & Placement Dossier
              </h1>
              <Badge className="bg-[#29136F] text-[#FFC20E] text-xs font-bold">
                EASA Batch 2025/2026
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Submit your academic standing and skill scores to unlock model placement predictions and AI roadmaps.
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="w-full md:w-56 p-3 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] space-y-1.5 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted-foreground text-[11px]">Profile Completion</span>
              <span className="text-[#29136F] font-mono">{profileCompletion}%</span>
            </div>
            <div className="h-2 w-full bg-[#E8E5F5] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  profileCompletion === 100
                    ? 'bg-[#168B55]'
                    : profileCompletion >= 60
                    ? 'bg-[#FFC20E]'
                    : 'bg-[#D94343]'
                )}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-[#D94343] border border-rose-200 text-xs font-medium flex items-center gap-2 animate-in fade-in-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E5F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F7F6FC]">
              <User className="h-4 w-4 text-[#29136F]" />
              <h2 className="text-sm font-bold text-[#29136F] uppercase tracking-wide">
                1. Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karthik Subramanian"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Register Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 710521104042"
                  value={formData.registerNumber}
                  onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@easa.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value as Department })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-semibold text-[#1D1745] focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  <option value="CSE">Computer Science & Engg (CSE)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                  <option value="CIVIL">Civil Engineering (CIVIL)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Graduation Batch</label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  <option value="2025">Class of 2025 (Final Year)</option>
                  <option value="2026">Class of 2026 (Pre-Final Year)</option>
                  <option value="2027">Class of 2027</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Standing */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E5F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F7F6FC]">
              <BookOpen className="h-4 w-4 text-[#29136F]" />
              <h2 className="text-sm font-bold text-[#29136F] uppercase tracking-wide">
                2. Academic Performance & Screening Baseline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">
                    Cumulative CGPA (0.00 – 10.00)
                  </label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.cgpa}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">10th / SSC Board Marks (%)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.tenthPercentage}%</span>
                </div>
                <input
                  type="number"
                  min="35"
                  max="100"
                  value={formData.tenthPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, tenthPercentage: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">12th / HSC Board Marks (%)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.twelfthPercentage}%</span>
                </div>
                <input
                  type="number"
                  min="35"
                  max="100"
                  value={formData.twelfthPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, twelfthPercentage: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Current Semester</label>
                <select
                  value={formData.currentSemester}
                  onChange={(e) =>
                    setFormData({ ...formData, currentSemester: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Active Arrears / Backlogs</label>
                <select
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-bold text-[#1D1745] focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  <option value={0}>0 Backlogs (Optimal Clearance)</option>
                  <option value={1}>1 Standing Backlog</option>
                  <option value={2}>2 Standing Backlogs</option>
                  <option value={3}>3+ Standing Backlogs</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">Classroom Attendance (%)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.attendancePercentage}%</span>
                </div>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={formData.attendancePercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, attendancePercentage: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Scores & Practical Portfolio */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E5F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F7F6FC]">
              <Code className="h-4 w-4 text-[#29136F]" />
              <h2 className="text-sm font-bold text-[#29136F] uppercase tracking-wide">
                3. Technical Competencies & Experience
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">Coding / DSA Score (0–100)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.programmingScore}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.programmingScore}
                  onChange={(e) =>
                    setFormData({ ...formData, programmingScore: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">Quantitative Aptitude (0–100)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.aptitudeScore}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.aptitudeScore}
                  onChange={(e) =>
                    setFormData({ ...formData, aptitudeScore: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">Core Technical Fundamentals (0–100)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.technicalScore}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.technicalScore}
                  onChange={(e) =>
                    setFormData({ ...formData, technicalScore: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1D1745]">Verbal & Communication (0–100)</label>
                  <span className="font-mono font-bold text-[#29136F]">{formData.communicationScore}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communicationScore}
                  onChange={(e) =>
                    setFormData({ ...formData, communicationScore: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs font-mono focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Internships Completed</label>
                <select
                  value={formData.internships}
                  onChange={(e) => setFormData({ ...formData, internships: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <option key={i} value={i}>
                      {i} Verified Internship(s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Capstone Projects</label>
                <select
                  value={formData.projects}
                  onChange={(e) => setFormData({ ...formData, projects: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((p) => (
                    <option key={p} value={p}>
                      {p} Technical Project(s)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Password */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E5F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F7F6FC]">
              <KeyRound className="h-4 w-4 text-[#29136F]" />
              <h2 className="text-sm font-bold text-[#29136F] uppercase tracking-wide">
                4. Account Security & Password
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-extrabold text-xs h-11 px-8 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering & Initializing Model...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Complete Registration & Launch Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterStudent;

