import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Compass,
  Zap,
  Target,
  Building2,
  CheckCircle2,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F6FC] text-[#1D1745] flex flex-col font-sans">
      {/* Top Institutional Header */}
      <header className="border-b border-[#E8E5F5] bg-white sticky top-0 z-50 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & College Title */}
          <div
            onClick={() => navigate('/landing')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="h-11 w-11 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 border border-[#E8E5F5] shadow-xs">
              <img
                src="/easa_logo.png"
                alt="EASA College of Engineering and Technology Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#29136F] uppercase leading-none block">
                EASA COLLEGE OF ENGINEERING AND TECHNOLOGY
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                <span className="font-bold text-[#1D1745]">COIMBATORE</span> • CampusHire AI Placement Portal
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs h-9 px-4 border-[#29136F]/30 text-[#29136F] hover:bg-[#29136F]/5 font-semibold"
            >
              Sign In
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/register')}
              className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Register as Student</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-12 pb-16 bg-gradient-to-b from-white via-[#F7F6FC] to-[#F7F6FC] border-b border-[#E8E5F5]">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#29136F]/10 border border-[#29136F]/20 text-[#29136F] text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-[#FFC20E] animate-pulse" />
            <span>Official EASA Placement Prediction & Career Recommendation System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1D1745] leading-tight max-w-4xl mx-auto">
            Empowering Your Engineering Career with{' '}
            <span className="text-[#29136F] underline decoration-[#FFC20E] decoration-4 underline-offset-8">
              Predictive AI Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive placement diagnostic portal designed for EASA students. Trained on a 5,000-student
            Random Forest classifier to evaluate your placement odds, pinpoint weak levers, and formulate personalized
            Gemini AI preparation roadmaps.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-extrabold text-sm h-12 px-7 rounded-2xl shadow-md flex items-center gap-2"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Student Registration & Profile Setup</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="bg-white border-[#29136F]/30 text-[#29136F] hover:bg-[#29136F]/5 font-bold text-sm h-12 px-6 rounded-2xl"
            >
              <span>Student Portal Login</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/predict')}
              className="text-[#29136F] hover:bg-[#E8E5F5] font-semibold text-sm h-12 px-5 rounded-2xl flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 text-[#FFC20E]" />
              <span>Try What-If Simulator</span>
            </Button>
          </div>

          {/* Institutional Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#168B55]" />
              <span>Anna University Affiliated</span>
            </span>
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-[#29136F]" />
              <span>Random Forest ML (AUC 0.924)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FFC20E]" />
              <span>Google Gemini 3.5 AI Advisor</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#29136F]" />
              <span>Tier 1, 2 & Mass Recruiters</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge className="bg-[#29136F] text-[#FFC20E] font-bold text-xs">
            Portal Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1745]">
            Everything You Need to Crack Campus Drives
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            From complete profile diagnostic scoring to interactive mock interviews and aptitude quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => navigate('/student-profile')}
            className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs hover:border-[#29136F]/40 hover:shadow-md transition-all space-y-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-[#29136F] text-[#FFC20E] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#1D1745] group-hover:text-[#29136F] transition-colors">Placement ML Predictor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Computes placement probability based on CGPA, arrears, aptitude, DSA scores, internships, and capstones using a trained Random Forest model.
            </p>
            <div className="text-[11px] font-bold text-[#29136F] flex items-center gap-1 pt-1">
              <span>SHAP Driver Breakdown</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate('/recommendations')}
            className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs hover:border-[#29136F]/40 hover:shadow-md transition-all space-y-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-[#FFC20E] text-[#29136F] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#1D1745] group-hover:text-[#29136F] transition-colors">Gemini AI Career Advisor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask placement questions in real-time. Receive customized 30-day DSA study plans, resume enhancements, and STAR mock interview feedback.
            </p>
            <div className="text-[11px] font-bold text-[#29136F] flex items-center gap-1 pt-1">
              <span>Integrated AI Chatbot</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate('/predict')}
            className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs hover:border-[#29136F]/40 hover:shadow-md transition-all space-y-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-[#168B55] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#1D1745] group-hover:text-[#29136F] transition-colors">Aptitude Assessment Quiz</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Take live, timed tests in quantitative, logical reasoning, and situational soft skills. Measured scores feed straight into the prediction engine.
            </p>
            <div className="text-[11px] font-bold text-[#29136F] flex items-center gap-1 pt-1">
              <span>Adaptive Question Engine</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigate('/drives')}
            className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs hover:border-[#29136F]/40 hover:shadow-md transition-all space-y-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-[#1D1745] text-[#FFC20E] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#1D1745] group-hover:text-[#29136F] transition-colors">Recruiter Tier Benchmarks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check institutional cutoff eligibility for Super Dream (18+ LPA), Dream (8–18 LPA), and Mass Recruiters (3.5–7 LPA) like TCS, Wipro, and Infosys.
            </p>
            <div className="text-[11px] font-bold text-[#29136F] flex items-center gap-1 pt-1">
              <span>Company Criteria Match</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Step Strip */}
      <section className="px-4 sm:px-8 py-14 bg-white border-y border-[#E8E5F5]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-[#1D1745]">
              Seamless Student Journey Workflow
            </h3>
            <p className="text-xs text-muted-foreground">
              From registration to drive readiness in 5 straightforward steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-center space-y-1.5">
              <div className="h-7 w-7 rounded-full bg-[#29136F] text-[#FFC20E] font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-xs text-[#1D1745]">Registration</h4>
              <p className="text-[11px] text-muted-foreground">
                Enter register number, academics & contact info
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-center space-y-1.5">
              <div className="h-7 w-7 rounded-full bg-[#29136F] text-[#FFC20E] font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-xs text-[#1D1745]">Profile Score</h4>
              <p className="text-[11px] text-muted-foreground">
                100% profile completion & baseline dashboard
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-center space-y-1.5">
              <div className="h-7 w-7 rounded-full bg-[#29136F] text-[#FFC20E] font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-xs text-[#1D1745]">ML Prediction</h4>
              <p className="text-[11px] text-muted-foreground">
                Random Forest placement likelihood & SHAP factors
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-center space-y-1.5">
              <div className="h-7 w-7 rounded-full bg-[#29136F] text-[#FFC20E] font-bold text-xs flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-bold text-xs text-[#1D1745]">AI Mentoring</h4>
              <p className="text-[11px] text-muted-foreground">
                Gemini AI career advisor with 7 preparation tracks
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-center space-y-1.5">
              <div className="h-7 w-7 rounded-full bg-[#29136F] text-[#FFC20E] font-bold text-xs flex items-center justify-center mx-auto">
                5
              </div>
              <h4 className="font-bold text-xs text-[#1D1745]">Audit History</h4>
              <p className="text-[11px] text-muted-foreground">
                Track simulated progress throughout placement season
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="px-4 sm:px-8 py-16 bg-[#29136F] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-white p-1 mx-auto shadow-md">
            <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Accelerate Your Placement Preparation?
          </h2>

          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Join your fellow EASA College engineering candidates. Complete your placement dossier today to review your
            diagnostic probability and unlock targeted career recommendations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-extrabold text-sm h-11 px-7 rounded-xl shadow-lg"
            >
              <span>Get Started — Register Profile</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white/30 text-white hover:bg-white/10 font-bold text-sm h-11 px-6 rounded-xl"
            >
              <span>Sign In to Existing Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="px-4 sm:px-8 py-8 bg-[#1D1745] text-white/70 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-bold text-white block">
              EASA COLLEGE OF ENGINEERING AND TECHNOLOGY
            </span>
            <p className="text-[11px] text-white/60">
              NH-47, Palakkad Main Road, Navakkarai, Coimbatore, Tamil Nadu – 641105.
            </p>
          </div>

          <div className="text-center md:text-right text-[11px] space-y-0.5">
            <p>CampusHire AI Placement Analytics System • v2.4.0</p>
            <p className="text-white/50">Approved by AICTE, New Delhi • Affiliated to Anna University, Chennai</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

