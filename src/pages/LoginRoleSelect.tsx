import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { UserRole } from '@/api/types';
import {
  GraduationCap,
  Shield,
  BookOpen,
  UserCheck,
  ArrowRight,
  Database,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const LoginRoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useAuthRole();

  const [email, setEmail] = useState('placement.director@campus.edu');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    navigate('/student-profile');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('student')) {
      handleRoleSelect('Student');
    } else if (email.includes('faculty') || email.includes('rao')) {
      handleRoleSelect('Faculty');
    } else {
      handleRoleSelect('Placement Officer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Banner */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-foreground">CampusHire</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                ERP Analytics
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Placement Cell Portal & ML Predictor</p>
          </div>
        </div>

        
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="teal" className="text-xs">
            Institutional Demo Preview
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Sign In to Placement Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Choose your institutional role to review persona-tailored dashboards, student directories, or personal prediction reports.
          </p>
        </div>

        {/* 3 Quick Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Role 1: Placement Officer */}
          <Card className="border shadow-md hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">Placement Officer (Admin)</CardTitle>
              <CardDescription className="text-xs">
                Full administrative access, campus-wide KPIs, all student records, model diagnostics & reports.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 pb-5 space-y-4">
              <div className="p-2.5 rounded-lg bg-secondary/50 border text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground block">Dr. Vikramaditya Rao</span>
                Director, Training & Placement
              </div>

              <Button
                onClick={() => handleRoleSelect('Placement Officer')}
                className="w-full text-xs flex items-center justify-center gap-1.5 group-hover:bg-primary/90"
              >
                <span>Enter as Placement Officer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Role 2: Faculty Coordinator */}
          <Card className="border shadow-md hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">Faculty / Coordinator</CardTitle>
              <CardDescription className="text-xs">
                Department-scoped cohort views, prioritized at-risk watchlists, and counseling logs.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 pb-5 space-y-4">
              <div className="p-2.5 rounded-lg bg-secondary/50 border text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground block">Prof. Sunita Rao</span>
                Department Coordinator (CSE)
              </div>

              <Button
                variant="outline"
                onClick={() => handleRoleSelect('Faculty')}
                className="w-full text-xs flex items-center justify-center gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <span>Enter as Faculty Coordinator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Role 3: Student Candidate */}
          <Card className="border shadow-md hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <GraduationCap className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">Student Candidate</CardTitle>
              <CardDescription className="text-xs">
                Personal readiness score, SHAP factor breakdown, and interactive What-If simulation studio.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 pb-5 space-y-4">
              <div className="p-2.5 rounded-lg bg-secondary/50 border text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground block">THICHANAMOORTHY THICHU</span>
                Candidate 720523106032 (ECE)
              </div>

              <Button
                variant="outline"
                onClick={() => handleRoleSelect('Student')}
                className="w-full text-xs flex items-center justify-center gap-1.5 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
              >
                <span>Enter as Student</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Standard Institutional Sign In Form (No Dark Patterns) */}
        <Card className="max-w-md mx-auto border shadow-sm">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-semibold">Institutional SSO / Email Sign In</CardTitle>
            <CardDescription className="text-xs">
              Direct authentication via college domain identity
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleCustomLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Campus Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded border bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded border bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-8 text-xs font-semibold mt-2">
                Sign In with Institutional ID
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer Disclaimer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-muted-foreground pt-4 border-t">
        <p>
          CampusHire Placement Analytics System • Powered by Random Forest ML Model
        </p>
        <p className="mt-0.5">
          For educational modeling & student career development purposes only.
        </p>
      </footer>
    </div>
  );
};

