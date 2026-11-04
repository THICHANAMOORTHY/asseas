import React, { createContext, useContext, useState } from 'react';
import { Department } from '../api/types';

interface FilterContextType {
  department: Department | 'ALL';
  setDepartment: (dept: Department | 'ALL') => void;
  batch: string | 'ALL';
  setBatch: (b: string | 'ALL') => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [department, setDepartment] = useState<Department | 'ALL'>('ALL');
  const [batch, setBatch] = useState<string | 'ALL'>('ALL');
  const [academicYear, setAcademicYear] = useState<string>('2024-2025');

  const resetFilters = () => {
    setDepartment('ALL');
    setBatch('ALL');
    setAcademicYear('2024-2025');
  };

  return (
    <FilterContext.Provider
      value={{
        department,
        setDepartment,
        batch,
        setBatch,
        academicYear,
        setAcademicYear,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useGlobalFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return ctx;
};

