import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, CurrentUser, Department } from '../api/types';

interface AuthRoleContextType {
  currentUser: CurrentUser;
  setRole: (role: UserRole) => void;
  setUser: (user: CurrentUser) => void;
  setFacultyDepartment: (dept: Department) => void;
  setStudentId: (id: string) => void;
  isPlacementOfficer: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const PRESET_USERS: Record<UserRole, CurrentUser> = {
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
    id: 'USR-STU-42',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'Student',
    studentId: 'CH-2025-0001',
  },
};

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem('campushire_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return PRESET_USERS['Placement Officer'];
  });

  useEffect(() => {
    localStorage.setItem('campushire_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const setRole = (role: UserRole) => {
    setCurrentUser(PRESET_USERS[role]);
  };

  const setUser = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  const setFacultyDepartment = (department: Department) => {
    setCurrentUser((prev) => ({
      ...prev,
      department,
    }));
  };

  const setStudentId = (studentId: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      studentId,
    }));
  };

  const isPlacementOfficer = currentUser.role === 'Placement Officer';
  const isFaculty = currentUser.role === 'Faculty';
  const isStudent = currentUser.role === 'Student';

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
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

