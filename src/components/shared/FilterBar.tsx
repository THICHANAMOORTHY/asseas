import React from 'react';
import { useGlobalFilters } from '@/context/FilterContext';
import { Department } from '@/api/types';
import { Filter, RotateCcw, Calendar, Building2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterBarProps {
  showDepartment?: boolean;
  showBatch?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showDepartment = true,
  showBatch = true,
  className = '',
}) => {
  const {
    department,
    setDepartment,
    batch,
    setBatch,
    academicYear,
    setAcademicYear,
    resetFilters,
  } = useGlobalFilters();

  const departments: (Department | 'ALL')[] = ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const batches = ['ALL', '2025', '2024'];

  const activeCount = (department !== 'ALL' ? 1 : 0) + (batch !== 'ALL' ? 1 : 0);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>

        {/* Academic Year */}
        <div className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Year:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            aria-label="Filter by Academic Year"
          >
            <option value="2024-2025">AY 2024–25 (Current)</option>
            <option value="2023-2024">AY 2023–24</option>
          </select>
        </div>

        {/* Department Filter */}
        {showDepartment && (
          <div className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1 text-xs">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Dept:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department | 'ALL')}
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
              aria-label="Filter by Department"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Batch Filter */}
        {showBatch && (
          <div className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1 text-xs">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Graduating:</span>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
              aria-label="Filter by Graduating Batch"
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Batches' : `Class of ${b}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-7 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};

