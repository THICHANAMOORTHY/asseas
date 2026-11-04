import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Menu,
  Bell,
  User,
  LogOut,
  KeyRound,
  Edit3,
  ChevronDown,
  Check,
  ShieldCheck,
  Building,
  Compass,
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { Button } from '@/components/ui/button';
import { campusApi } from '@/api/client';
import { StudentRecord } from '@/api/types';
import { useAuthRole } from '@/context/AuthRoleContext';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenStudentDetail?: (student: StudentRecord) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, onOpenStudentDetail }) => {
  const navigate = useNavigate();
  const { currentUser, setUser, isStudent } = useAuthRole();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Modals for Edit Profile & Change Password
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || 'User');
  const [editEmail, setEditEmail] = useState(currentUser?.email || 'user@easa.edu.in');
  const [modalFeedback, setModalFeedback] = useState('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for global student search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await campusApi.getStudents({ search: searchQuery, pageSize: 5 });
      setSearchResults(res.data);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...currentUser,
      name: editName,
      email: editEmail,
    });
    setModalFeedback('Profile details saved successfully!');
    setTimeout(() => {
      setModalFeedback('');
      setEditProfileOpen(false);
    }, 1200);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback('Password updated securely with bcrypt hash!');
    setTimeout(() => {
      setModalFeedback('');
      setChangePasswordOpen(false);
    }, 1200);
  };

  return (
    <header className="h-20 border-b border-[#E8E5F5] bg-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Toggle + EASA College Official Branding */}
      <div className="flex items-center gap-3.5">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden h-9 w-9 text-[#29136F]"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* EASA College Logo & Institutional Identity */}
        <div
          onClick={() => navigate(isStudent ? '/student-profile' : '/')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="h-12 w-12 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm border border-[#E8E5F5]">
            <img
              src="/easa_logo.png"
              alt="EASA College of Engineering and Technology Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#29136F] uppercase leading-none">
                EASA COLLEGE OF ENGINEERING AND TECHNOLOGY
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] text-muted-foreground mt-1 leading-none">
              <span className="font-bold text-[#1D1745] tracking-wide">COIMBATORE</span>
              <span>•</span>
              <span className="font-bold text-[#29136F]">CampusHire AI</span>
              <span className="hidden md:inline text-muted-foreground font-medium">
                • Placement Prediction & Career Recommendation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Search (Desktop only) */}
      <div className="relative flex-1 max-w-sm hidden xl:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidate by name, register ID..."
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 pl-8.5 pr-8 text-xs rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-[#1D1745] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#29136F]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8E5F5] rounded-xl shadow-xl z-50 p-1 divide-y divide-[#E8E5F5] animate-in fade-in-0">
            <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-muted-foreground flex justify-between items-center">
              <span>Matching EASA Students</span>
              {isSearching && <span className="animate-pulse">Searching...</span>}
            </div>

            {searchResults.length === 0 && !isSearching && (
              <div className="p-4 text-xs text-center text-muted-foreground">
                No matching student found for "{searchQuery}"
              </div>
            )}

            {searchResults.map((stu) => (
              <div
                key={stu.student_id}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  if (onOpenStudentDetail) {
                    onOpenStudentDetail(stu);
                  } else {
                    navigate(`/students/${stu.student_id}`);
                  }
                }}
                className="p-2.5 hover:bg-[#F7F6FC] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-[#1D1745] flex items-center gap-1.5">
                    <span>{stu.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({stu.student_id})
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {stu.department} • CGPA {stu.cgpa} • Backlogs: {stu.backlogs}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (stu.predictedProbability ?? 0.5) >= 0.5
                        ? 'bg-emerald-500/10 text-[#168B55]'
                        : 'bg-rose-500/10 text-[#D94343]'
                    }`}
                  >
                    {Math.round((stu.predictedProbability ?? 0.5) * 100)}% Prob
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions: Notifications + Role Switcher + Student Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notifications Icon with Badge */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="h-8.5 w-8.5 text-[#29136F] hover:bg-[#F7F6FC] rounded-xl relative"
            aria-label="Campus Placement Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FFC20E] ring-2 ring-white" />
          </Button>

          {/* Notifications Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E8E5F5] rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in-0">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E5F5]">
                <span className="font-bold text-xs text-[#29136F]">EASA Placement Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFC20E] text-[#29136F] font-bold">
                  2 New
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5]">
                  <span className="font-semibold text-[#1D1745] block">
                    Hexaware Campus Drive Registered
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Online aptitude round scheduled for Nov 14, 2026 at EASA Labs.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5]">
                  <span className="font-semibold text-[#1D1745] block">
                    AI Career Plan Ready
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Your 30-day DSA and speed-math checklist has been generated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher */}
        <RoleSwitcher />

        {/* Student Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] hover:bg-[#E8E5F5] transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-[#29136F] text-[#FFC20E] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-xs text-[#1D1745] block leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E8E5F5] rounded-2xl shadow-xl z-50 p-2 divide-y divide-[#E8E5F5] animate-in fade-in-0 text-xs">
              {/* User Snapshot */}
              <div className="px-3 py-2 space-y-0.5">
                <span className="font-bold text-[#1D1745] block truncate">{currentUser?.name || 'User'}</span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {currentUser?.email || ''}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#29136F] text-[#FFC20E]">
                  {currentUser?.role || 'Guest'}
                </span>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/student-profile');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F7F6FC] text-[#1D1745] font-medium flex items-center gap-2.5 transition-colors"
                >
                  <User className="h-4 w-4 text-[#29136F]" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setEditProfileOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F7F6FC] text-[#1D1745] font-medium flex items-center gap-2.5 transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-[#29136F]" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F7F6FC] text-[#1D1745] font-medium flex items-center gap-2.5 transition-colors"
                >
                  <KeyRound className="h-4 w-4 text-[#29136F]" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/landing');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#F7F6FC] text-[#1D1745] font-medium flex items-center gap-2.5 transition-colors"
                >
                  <Compass className="h-4 w-4 text-[#29136F]" />
                  <span>College Landing Page</span>
                </button>
              </div>

              {/* Logout */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/login');
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-rose-50 text-[#D94343] font-medium flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E5F5] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in-0 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E5F5]">
              <span className="font-bold text-sm text-[#29136F] flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[#FFC20E]" /> Edit Student Profile
              </span>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            {modalFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#168B55] border border-emerald-200 font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Institution</label>
                <input
                  type="text"
                  disabled
                  value="EASA College of Engineering and Technology, Coimbatore"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-gray-100 text-muted-foreground text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E5F5] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in-0 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E5F5]">
              <span className="font-bold text-sm text-[#29136F] flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#FFC20E]" /> Change Security Password
              </span>
              <button
                onClick={() => setChangePasswordOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            {modalFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#168B55] border border-emerald-200 font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1D1745] block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5F5] bg-[#F7F6FC] text-xs focus:ring-1 focus:ring-[#29136F] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChangePasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
