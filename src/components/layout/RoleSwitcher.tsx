import React from 'react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { UserRole, Department } from '@/api/types';
import { UserCheck, Shield, BookOpen, GraduationCap, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, setRole, setFacultyDepartment } = useAuthRole();

  const roles: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'Placement Officer',
      title: 'Placement Officer (Admin)',
      desc: 'Full campus analytics, model audits, all students',
      icon: <Shield className="h-4 w-4 text-primary" />,
    },
    {
      role: 'Faculty',
      title: 'Faculty / Coordinator',
      desc: 'Dept at-risk lists, mentoring notes',
      icon: <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      role: 'Student',
      title: 'Student View',
      desc: 'Personal prediction, readiness, suggestions',
      icon: <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    },
  ];

  const depts: Department[] = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background hover:bg-accent text-xs font-medium shadow-sm transition-all text-left"
          aria-label="Switch User Role"
        >
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            {currentUser.role === 'Placement Officer' && <Shield className="h-3.5 w-3.5 text-primary" />}
            {currentUser.role === 'Faculty' && <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
            {currentUser.role === 'Student' && <GraduationCap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </div>

          <div className="hidden sm:block leading-tight">
            <div className="font-semibold text-foreground text-[11px] flex items-center gap-1">
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span>{currentUser.role}</span>
              {currentUser.department && <Badge variant="outline" className="px-1 py-0 text-[9px]">{currentUser.department}</Badge>}
            </div>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-1 w-64 p-1.5 bg-card border rounded-lg shadow-lg z-50 hidden group-hover:block animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b mb-1">
            Switch View Role (Demo)
          </div>

          <div className="space-y-1">
            {roles.map((item) => (
              <button
                key={item.role}
                onClick={() => setRole(item.role)}
                className={`w-full flex items-start gap-2.5 p-2 rounded-md text-left transition-colors text-xs ${
                  currentUser.role === item.role
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-medium text-xs">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {currentUser.role === 'Faculty' && (
            <div className="mt-2 pt-2 border-t px-2">
              <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                Faculty Scope Department:
              </label>
              <div className="grid grid-cols-3 gap-1">
                {depts.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFacultyDepartment(d)}
                    className={`text-[10px] py-1 px-1.5 rounded border text-center ${
                      currentUser.department === d
                        ? 'bg-primary text-primary-foreground font-semibold border-primary'
                        : 'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

