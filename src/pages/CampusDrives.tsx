import React, { useState, useEffect } from 'react';
import { campusApi } from '@/api/client';
import { CAMPUS_DRIVES, CampusDrive } from '@/api/drivesData';
import { useAuthRole } from '@/context/AuthRoleContext';
import { Department } from '@/api/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const CampusDrives: React.FC = () => {
  const { currentUser, isStudent } = useAuthRole();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [registeredDrives, setRegisteredDrives] = useState<Record<string, boolean>>({});

  // Real candidate stats loaded from student profile
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  useEffect(() => {
    campusApi.getStudentById(currentUser.studentId || '720523106032').then((stu) => {
      if (stu) setCandidateProfile(stu);
    });
  }, [currentUser.studentId]);

  const candidateStats = {
    cgpa: candidateProfile?.cgpa ?? 8.11,
    department: (candidateProfile?.department || currentUser.department || 'ECE') as Department,
    backlogs: candidateProfile?.backlogs ?? 0,
    programming_score: candidateProfile?.programming_score ?? 78,
  };

  const checkEligibility = (drive: CampusDrive) => {
    const isDeptOk = drive.eligibleDepartments.includes(candidateStats.department);
    const isCgpaOk = candidateStats.cgpa >= drive.minCgpa;
    const isBacklogsOk = candidateStats.backlogs <= drive.maxBacklogs;
    const isProgOk = candidateStats.programming_score >= drive.minProgrammingScore;

    const unmet: string[] = [];
    if (!isDeptOk) unmet.push(`Branch not eligible (Requires ${drive.eligibleDepartments.join('/')})`);
    if (!isCgpaOk) unmet.push(`Min CGPA ${drive.minCgpa} (Current: ${candidateStats.cgpa})`);
    if (!isBacklogsOk) unmet.push(`Max ${drive.maxBacklogs} backlogs allowed`);
    if (!isProgOk) unmet.push(`Min Coding Score ${drive.minProgrammingScore}+`);

    return {
      isEligible: isDeptOk && isCgpaOk && isBacklogsOk && isProgOk,
      unmet,
    };
  };

  const handleRegister = (driveId: string) => {
    setRegisteredDrives((prev) => ({
      ...prev,
      [driveId]: true,
    }));
  };

  const filteredDrives = CAMPUS_DRIVES.filter((d) => {
    const matchesSearch =
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || d.tier === tierFilter;
    const matchesDept =
      deptFilter === 'ALL' || d.eligibleDepartments.includes(deptFilter as any);
    return matchesSearch && matchesTier && matchesDept;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" /> Campus Recruitment Drives Hub
            </h1>
            <Badge variant="teal" className="text-xs">
              Live Season 2024–25
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Active corporate hiring schedules, qualification thresholds, and real-time candidate eligibility checks.
          </p>
        </div>

        {/* Candidate Context Pill */}
        <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl border bg-card text-xs shadow-2xs">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
            {candidateStats.department}
          </div>
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-foreground block">
              Candidate: {currentUser.name}
            </span>
            <span className="text-muted-foreground">
              CGPA {candidateStats.cgpa} • 0 Backlogs • Coding {candidateStats.programming_score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-md border bg-background text-xs w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-8 rounded-md border bg-background px-2.5 text-xs text-foreground cursor-pointer"
          >
            <option value="ALL">All Company Tiers</option>
            <option value="Tier-1 Product">Tier-1 Product (₹18+ LPA)</option>
            <option value="Fintech & Core">Fintech & Core Tech</option>
            <option value="Global IT">Global IT Consultancies</option>
            <option value="Core Engineering">Core Engineering</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-8 rounded-md border bg-background px-2.5 text-xs text-foreground cursor-pointer"
          >
            <option value="ALL">All Eligible Branches</option>
            {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredDrives.length} active drive(s)
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrives.map((drive) => {
          const { isEligible, unmet } = checkEligibility(drive);
          const isRegistered = registeredDrives[drive.id];

          return (
            <Card
              key={drive.id}
              className={`border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isEligible ? 'hover:border-primary/50' : 'opacity-85'
              }`}
            >
              <div>
                {/* Header */}
                <CardHeader className="pb-3 border-b bg-muted/15 flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl ${drive.logoBg} text-white font-extrabold flex items-center justify-center text-xs tracking-wider shadow-xs shrink-0`}
                    >
                      {drive.logoText}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground leading-tight">
                        {drive.companyName}
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold text-primary mt-0.5">
                        {drive.ctc}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge
                    variant={
                      drive.tier === 'Tier-1 Product'
                        ? 'default'
                        : drive.tier === 'Fintech & Core'
                        ? 'teal'
                        : 'secondary'
                    }
                    className="text-[10px] shrink-0"
                  >
                    {drive.tier}
                  </Badge>
                </CardHeader>

                {/* Details */}
                <CardContent className="p-4 space-y-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-foreground text-xs block">{drive.role}</span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {drive.location}
                      </span>
                      <span>•</span>
                      <span>{drive.openings} Openings</span>
                    </div>
                  </div>

                  {/* Cutoff Criteria */}
                  <div className="p-2.5 rounded-lg bg-secondary/30 border space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min CGPA:</span>
                      <strong className="text-foreground">{drive.minCgpa.toFixed(1)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Arrears / Backlogs:</span>
                      <strong className="text-foreground">{drive.maxBacklogs === 0 ? 'Zero Backlogs' : `${drive.maxBacklogs} allowed`}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coding Benchmark:</span>
                      <strong className="text-foreground">{drive.minProgrammingScore}/100</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Branches:</span>
                      <span className="font-semibold text-foreground">{drive.eligibleDepartments.join(', ')}</span>
                    </div>
                  </div>

                  {/* Live Candidate Eligibility Status */}
                  <div
                    className={`p-2.5 rounded-lg border text-xs ${
                      isEligible
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      {isEligible ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Candidate Profile Matches Criteria</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Eligibility Gaps Detected</span>
                        </>
                      )}
                    </div>

                    {!isEligible && unmet.length > 0 && (
                      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[10px]">
                        {unmet.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Recruitment Rounds */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Drive Stages
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {drive.selectionRounds.map((round, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground border"
                        >
                          {round}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 border-t mt-2 flex items-center justify-between text-xs">
                <div className="text-[11px] text-muted-foreground">
                  <span className="block font-medium text-foreground">Drive: {drive.driveDate}</span>
                  <span>Deadline: {drive.deadline}</span>
                </div>

                {isRegistered ? (
                  <Badge variant="success" className="text-xs py-1 px-3">
                    Registered ✓
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={!isEligible}
                    onClick={() => handleRegister(drive.id)}
                    className="h-8 text-xs font-semibold shadow-2xs"
                  >
                    {isEligible ? 'Register for Drive' : 'Ineligible'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

