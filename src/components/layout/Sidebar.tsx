import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  AlertTriangle,
  LineChart,
  FileText,
  BookOpen,
  Settings,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Cloud,
  History,
  Compass,
} from 'lucide-react';
import { useAuthRole } from '@/context/AuthRoleContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, isPlacementOfficer, isFaculty, isStudent } = useAuthRole();

  interface NavItem {
    label: string;
    to: string;
    icon: React.ReactNode;
    badge?: string;
    roles: ('Placement Officer' | 'Faculty' | 'Student')[];
  }

  // Strictly 4 main items for Student as required by EASA College guidelines
  const studentNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      to: '/student-profile',
      icon: <GraduationCap className="h-4 w-4" />,
      badge: 'Profile',
      roles: ['Student'],
    },
    {
      label: 'Placement Prediction',
      to: '/predict',
      icon: <BrainCircuit className="h-4 w-4" />,
      badge: 'What-If',
      roles: ['Student'],
    },
    {
      label: 'Career Recommendations',
      to: '/recommendations',
      icon: <Compass className="h-4 w-4" />,
      badge: 'AI Advisor',
      roles: ['Student'],
    },
    {
      label: 'Prediction History',
      to: '/history',
      icon: <History className="h-4 w-4" />,
      badge: 'Audit',
      roles: ['Student'],
    },
  ];

  // Officer & Faculty navigation items
  const officerFacultyNavItems: NavItem[] = [
    {
      label: 'Analytics Dashboard',
      to: '/',
      icon: <LayoutDashboard className="h-4 w-4" />,
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Student Directory',
      to: '/students',
      icon: <Users className="h-4 w-4" />,
      badge: '360',
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Placement Prediction',
      to: '/predict',
      icon: <BrainCircuit className="h-4 w-4" />,
      badge: 'Studio',
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Career Recommendations',
      to: '/recommendations',
      icon: <Compass className="h-4 w-4" />,
      badge: 'AI Advisor',
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Prediction History',
      to: '/history',
      icon: <History className="h-4 w-4" />,
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'At-Risk & Mentoring',
      to: '/at-risk',
      icon: <AlertTriangle className="h-4 w-4 text-[#FFC20E]" />,
      badge: 'Priority',
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Model Insights',
      to: '/model',
      icon: <LineChart className="h-4 w-4" />,
      badge: '0.924 AUC',
      roles: ['Placement Officer'],
    },
    {
      label: 'Campus Drives',
      to: '/drives',
      icon: <Briefcase className="h-4 w-4" />,
      badge: 'Live',
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Placement Reports',
      to: '/reports',
      icon: <FileText className="h-4 w-4" />,
      roles: ['Placement Officer', 'Faculty'],
    },
    {
      label: 'Supabase Cloud Hub',
      to: '/cloud-status',
      icon: <Cloud className="h-4 w-4 text-emerald-400" />,
      badge: 'Online',
      roles: ['Placement Officer'],
    },
    {
      label: 'Role Governance & Rules',
      to: '/settings',
      icon: <BookOpen className="h-4 w-4" />,
      roles: ['Placement Officer', 'Faculty'],
    },
  ];

  const visibleNav = isStudent
    ? studentNavItems
    : officerFacultyNavItems.filter((item) =>
        currentUser?.role ? item.roles.includes(currentUser.role) : true
      );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#29136F] text-white border-r border-[#381A91] transition-all duration-300 lg:static shadow-xl",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header with EASA College Logo */}
        <div className="h-16 border-b border-[#381A91] flex items-center justify-between px-4 bg-[#1D1745]/40">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs tracking-tight text-white block truncate uppercase">
                  EASA Placement
                </span>
                <p className="text-[10px] text-[#FFC20E] font-medium tracking-wide">
                  CampusHire AI Portal
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center shadow-md">
              <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 rounded-md border border-white/20 items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Current Active Role Banner */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white">
          {!collapsed ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[#FFC20E] tracking-wider">
                  Active Workspace
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="font-bold text-xs text-white truncate">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-white/80 truncate">
                {currentUser?.role || ''} {currentUser?.department ? `• ${currentUser.department}` : ''}
              </div>
            </div>
          ) : (
            <div className="text-center font-bold text-[10px] text-[#FFC20E]">
              {currentUser?.role?.[0] || 'U'}
            </div>
          )}
        </div>

        {/* Navigation Section Title */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
            {isStudent ? 'Student Placement Portal' : 'Placement Governance'}
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-[#FFC20E] text-[#29136F] shadow-md font-bold"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 text-inherit font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with EASA Accreditation & Model Telemetry */}
        <div className="p-3 border-t border-[#381A91] text-[11px] text-white/70 bg-[#1D1745]/30">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#FFC20E] font-medium">Random Forest Model</span>
                <span className="text-emerald-400 font-bold">v2.4 Online</span>
              </div>
              <div className="text-[10px] text-white/60 font-mono">
                EASA College • Coimbatore
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" title="Model Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
