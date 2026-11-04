import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, CurrentUser, Department } from '../api/types';

interface AuthRoleContextType {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  login: (user: CurrentUser) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setUser: (user: CurrentUser) => void;
  setFacultyDepartment: (dept: Department) => void;
  setStudentId: (id: string) => void;
  isPlacementOfficer: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

export const PRESET_USERS: Record<UserRole, CurrentUser> = {
  'Placement Officer': {
    id: 'USR-PO-01',
    name: 'Dr. Vikramaditya Rao',
    email: 'placement.director@campus.edu',
    role: 'Placement Officer',
  },
  'Faculty': {
    id: 'USR-FAC-04',
    name: 'Prof. Sunita Rao',
    email: 'sunita.rao@campus.edu',
    role: 'Faculty',
    department: 'CSE',
  },
  'Student': {
    id: '720523106032',
    name: 'THICHANAMOORTHY THICHU',
    email: 'thichu683@gmail.com',
    role: 'Student',
    studentId: '720523106032',
    department: 'ECE',
  },
};

const DEFAULT_GUEST: CurrentUser = {
  id: '',
  name: 'Candidate',
  email: '',
  role: 'Student',
  studentId: '720523106032',
  department: 'ECE',
};

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserState, setCurrentUserState] = useState<CurrentUser | null>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const authSession = localStorage.getItem('campushire_auth_session');
        const saved = localStorage.getItem('campushire_active_user');
        if (authSession === 'active' && saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name && parsed.role) {
            if (parsed.studentId === 'CH-2025-0001' || parsed.name === 'Aarav Sharma') {
              return PRESET_USERS['Student'];
            }
            return parsed;
          }
        }
      }
    } catch {}
    // Compulsory sign in: not authenticated by default!
    return null;
  });

  const isAuthenticated = Boolean(currentUserState);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      if (currentUserState) {
        localStorage.setItem('campushire_auth_session', 'active');
        localStorage.setItem('campushire_active_user', JSON.stringify(currentUserState));
      } else {
        localStorage.removeItem('campushire_auth_session');
        localStorage.removeItem('campushire_active_user');
      }
    }
  }, [currentUserState]);

  const login = (user: CurrentUser) => {
    try {
      localStorage.setItem('campushire_auth_session', 'active');
      localStorage.setItem('campushire_active_user', JSON.stringify(user));
    } catch {}
    setCurrentUserState(user);
  };

  const logout = () => {
    try {
      localStorage.removeItem('campushire_auth_session');
      localStorage.removeItem('campushire_active_user');
    } catch {}
    setCurrentUserState(null);
  };

  const setRole = (role: UserRole) => {
    const newUser = PRESET_USERS[role];
    login(newUser);
  };

  const setUser = (user: CurrentUser) => {
    login(user);
  };

  const setFacultyDepartment = (department: Department) => {
    setCurrentUserState((prev) => (prev ? { ...prev, department } : prev));
  };

  const setStudentId = (studentId: string) => {
    setCurrentUserState((prev) => (prev ? { ...prev, studentId } : prev));
  };

  const currentUser = currentUserState || DEFAULT_GUEST;
  const isPlacementOfficer = currentUser.role === 'Placement Officer';
  const isFaculty = currentUser.role === 'Faculty';
  const isStudent = currentUser.role === 'Student';

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        setRole,
        setUser,
        setFacultyDepartment,
        setStudentId,
        isPlacementOfficer,
        isFaculty,
        isStudent,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const ctx = useContext(AuthRoleContext);
  if (!ctx) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return ctx;
};
