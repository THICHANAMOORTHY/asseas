import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole, PRESET_USERS } from '@/context/AuthRoleContext';
import { UserRole } from '@/api/types';
import {
  GraduationCap,
  Shield,
  BookOpen,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  KeyRound,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, setRole, setUser } = useAuthRole();

  const [loginRole, setLoginRole] = useState<'Student' | 'Officer' | 'Faculty'>('Student');
  const [identifier, setIdentifier] = useState('720523106032');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (role: 'Student' | 'Officer' | 'Faculty') => {
    setLoginRole(role);
    setErrorMessage('');
    if (role === 'Student') {
      setIdentifier('720523106032');
      setPassword('');
    } else if (role === 'Officer') {
      setIdentifier('placement.director@easa.edu.in');
      setPassword('adminPass2026');
    } else {
      setIdentifier('sunita.rao@easa.edu.in');
      setPassword('facultyPass2026');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Register Number or institutional email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (loginRole === 'Student') {
        let matchedId = identifier.trim();
        let resolvedName = 'THICHANAMOORTHY THICHU';
        let resolvedDept = 'ECE';

        if (matchedId === '720523106037') {
          resolvedName = 'Thichu Thichana';
          resolvedDept = 'ECE';
        } else if (matchedId === '927621BCS088') {
          resolvedName = 'Karthik Raja';
          resolvedDept = 'CSE';
        } else if (matchedId !== '720523106032') {
          resolvedName = 'Student Candidate';
        }

        try {
          const stored = localStorage.getItem(`campushire_student_${identifier}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            resolvedName = parsed.name || resolvedName;
            resolvedDept = parsed.department || resolvedDept;
            matchedId = parsed.student_id || matchedId;
          }
        } catch {}

        login({
          id: matchedId,
          name: resolvedName,
          email: identifier.includes('@') ? identifier : `${identifier}@easa.edu.in`,
          role: 'Student',
          studentId: matchedId,
          department: resolvedDept as any,
        });
        navigate('/student-profile');
      } else if (loginRole === 'Faculty') {
        login(PRESET_USERS['Faculty']);
        navigate('/student-profile');
      } else {
        login(PRESET_USERS['Placement Officer']);
        navigate('/student-profile');
      }
    }, 400);
  };

  const handleQuickDemo = (role: UserRole, studentId?: string) => {
    login(PRESET_USERS[role]);
    navigate('/student-profile');
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotModalOpen(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F6FC] text-[#1D1745] flex flex-col font-sans justify-between">
      {/* Top Header */}
      <header className="border-b border-[#E8E5F5] bg-white px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
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
                Campus Placement Portal & AI Predictor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/landing')}
              className="text-xs h-8 px-3 border-[#29136F]/30 text-[#29136F] hover:bg-[#29136F]/5"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 my-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-white p-2 mx-auto shadow-md border border-[#E8E5F5]">
            <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1745]">
            Placement Portal Sign In
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in with your institutional credentials to review placement readiness & AI roadmaps
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E5F5] shadow-sm space-y-5">
          {/* Role Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5]">
            <button
              type="button"
              onClick={() => handleRoleTabChange('Student')}
              className={cn(
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                loginRole === 'Student'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745]'
              )}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('Faculty')}
              className={cn(
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                loginRole === 'Faculty'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745]'
              )}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('Officer')}
              className={cn(
                'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all',
                loginRole === 'Officer'
                  ? 'bg-[#29136F] text-[#FFC20E] shadow-xs'
                  : 'text-muted-foreground hover:text-[#1D1745]'
              )}
            >
              Placement Cell
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 text-[#D94343] border border-rose-200 text-xs font-medium flex items-center gap-2 animate-in fade-in-0">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#1D1745] block mb-1">
                {loginRole === 'Student' ? 'Register Number / Email' : 'Institutional Email Address'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginRole === 'Student' ? 'e.g. 710521104042 or student@easa.edu.in' : 'name@easa.edu.in'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-[#1D1745]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-[#29136F] font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none pr-9"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#29136F] focus:ring-[#29136F]"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-extrabold text-xs h-10 rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Placement Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-[#E8E5F5] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('Student', '720523106032')}
                className="p-2 rounded-lg bg-[#F7F6FC] hover:bg-[#E8E5F5] border border-[#E8E5F5] text-left flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-[#1D1745] block">THICHANAMOORTHY THICHU</span>
                  <span className="text-[10px] text-muted-foreground">Student • ECE (720523106032)</span>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  Sign In →
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('Placement Officer')}
                className="p-2 rounded-lg bg-[#F7F6FC] hover:bg-[#E8E5F5] border border-[#E8E5F5] text-left flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-[#1D1745] block">Dr. Vikramaditya Rao</span>
                  <span className="text-[10px] text-muted-foreground">Placement Officer (Admin)</span>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  Sign In →
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Link to Registration */}
        <div className="text-center text-xs space-y-1">
          <span className="text-muted-foreground">New EASA engineering student?</span>
          <div>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-bold text-[#29136F] hover:underline inline-flex items-center gap-1"
            >
              <span>Register & Complete Placement Profile</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E5F5] rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in-0 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E5F5]">
              <span className="font-bold text-sm text-[#29136F] flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#FFC20E]" /> Password Recovery
              </span>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-[#168B55] border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Password reset token sent to your institutional email.</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Enter your registered institutional email or register number to receive a secure password reset link.
                </p>
                <div>
                  <input
                    type="text"
                    placeholder="e.g. 710521104042 or student@easa.edu.in"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-[#E8E5F5] bg-white">
        EASA College of Engineering and Technology • Navakkarai, Coimbatore – 641105
      </footer>
    </div>
  );
};

export default Login;

