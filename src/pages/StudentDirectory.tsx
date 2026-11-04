import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import { campusApi, StudentFilterParams } from '@/api/client';
import { StudentRecord, Department } from '@/api/types';
import { useAuthRole } from '@/context/AuthRoleContext';
import { StudentDetailDrawer } from '@/components/student/StudentDetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const StudentDirectory: React.FC = () => {
  const { currentUser, isFaculty } = useAuthRole();

  // Filter params
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<Department | 'ALL'>(
    isFaculty && currentUser.department ? currentUser.department : 'ALL'
  );
  const [gender, setGender] = useState<string>('ALL');
  const [placed, setPlaced] = useState<'ALL' | 'PLACED' | 'NOT_PLACED'>('ALL');
  const [backlogs, setBacklogs] = useState<'ALL' | 'CLEAN' | 'HAS_BACKLOGS'>('ALL');
  const [batch, setBatch] = useState<string>('ALL');
  const [riskLevel, setRiskLevel] = useState<'ALL' | 'AT_RISK' | 'SAFE'>('ALL');

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'student_id', desc: false }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    gender: false,
    extracurricular_activities: false,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Data fetching state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer state
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  // Load students
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const sortField = sorting.length > 0 ? (sorting[0].id as keyof StudentRecord) : undefined;
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

      const res = await campusApi.getStudents({
        search,
        department,
        gender,
        placed,
        backlogs,
        batch,
        riskLevel,
        sortField,
        sortOrder,
        page,
        pageSize,
      });

      setStudents(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, gender, placed, backlogs, batch, riskLevel, page, pageSize, sorting]);

  // TanStack table columns definition
  const columns = useMemo<ColumnDef<StudentRecord>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-input text-primary focus:ring-primary cursor-pointer h-4 w-4"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-input text-primary focus:ring-primary cursor-pointer h-4 w-4"
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'student_id',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-semibold hover:text-foreground text-xs"
          >
            Student ID
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            {row.getValue('student_id')}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Candidate Name',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div>
              <div className="font-semibold text-xs text-foreground">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'department',
        header: 'Branch',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-medium">
            {row.getValue('department')}
          </Badge>
        ),
      },
      {
        accessorKey: 'cgpa',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-semibold hover:text-foreground text-xs"
          >
            CGPA
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold tabular-nums text-xs text-foreground">
            {Number(row.getValue('cgpa')).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'backlogs',
        header: 'Backlogs',
        cell: ({ row }) => {
          const val = Number(row.getValue('backlogs'));
          return (
            <Badge
              variant={val === 0 ? 'success' : 'danger'}
              className="text-[11px] tabular-nums"
            >
              {val === 0 ? '0 Backlogs' : `${val} Arrears`}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'technical_score',
        header: 'Tech / DSA',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="text-xs tabular-nums text-muted-foreground">
              <span className="font-medium text-foreground">{s.technical_score}</span> / {s.programming_score}
            </div>
          );
        },
      },
      {
        accessorKey: 'internships',
        header: 'Internships',
        cell: ({ row }) => (
          <span className="text-xs tabular-nums text-foreground">
            {row.getValue('internships')} completed
          </span>
        ),
      },
      {
        accessorKey: 'predictedProbability',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-semibold hover:text-foreground text-xs"
          >
            Predicted Odds
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const prob = Number(row.getValue('predictedProbability') ?? 0.5);
          const pct = Math.round(prob * 100);
          return (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold tabular-nums ${
                pct >= 65 ? 'text-emerald-600 dark:text-emerald-400' : (pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')
              }`}>
                {pct}%
              </span>
              <div className="w-12 bg-secondary h-1.5 rounded-full overflow-hidden hidden sm:block">
                <div
                  className={`h-full rounded-full ${
                    pct >= 65 ? 'bg-emerald-500' : (pct >= 40 ? 'bg-amber-500' : 'bg-rose-500')
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'placed',
        header: 'Status',
        cell: ({ row }) => {
          const placed = row.getValue('placed') === 1;
          return (
            <Badge variant={placed ? 'success' : 'secondary'} className="text-[10px]">
              {placed ? 'Placed' : 'In Process'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStudent(row.original);
              setDrawerOpen(true);
            }}
            className="h-7 text-xs flex items-center gap-1 text-primary hover:text-primary/80"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Button>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  // CSV Export for filtered or selected rows
  const handleExportCsv = () => {
    const selectedIndices = Object.keys(rowSelection);
    const exportDataset = selectedIndices.length > 0
      ? students.filter((_, idx) => rowSelection[idx])
      : students;

    if (exportDataset.length === 0) return;

    const headers = [
      'student_id', 'name', 'department', 'gender', 'cgpa', 'backlogs',
      'tenth_percentage', 'twelfth_percentage', 'aptitude_score',
      'technical_score', 'programming_score', 'communication_score',
      'interview_score', 'internships', 'projects', 'attendance_percentage',
      'predictedProbability', 'placed'
    ];

    const csvRows = [headers.join(',')];
    for (const s of exportDataset) {
      const row = headers.map((h) => (s as any)[h] ?? '');
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campushire-students-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAllFilters = () => {
    setSearch('');
    if (!isFaculty) setDepartment('ALL');
    setGender('ALL');
    setPlaced('ALL');
    setBacklogs('ALL');
    setBatch('ALL');
    setRiskLevel('ALL');
    setPage(1);
  };

  const hasActiveFilters = search || (department !== 'ALL' && !isFaculty) || gender !== 'ALL' || placed !== 'ALL' || backlogs !== 'ALL' || batch !== 'ALL' || riskLevel !== 'ALL';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Student Directory
            </h1>
            <Badge variant="secondary" className="text-xs font-mono">
              {total} Total Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Server-style paginated directory with multi-filters, inline drawer inspection & CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
              className="text-xs flex items-center gap-1.5 h-8"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Columns</span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {columnDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 p-2 bg-card border rounded-lg shadow-xl z-50 text-xs space-y-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1 block">
                  Toggle Columns
                </span>
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'select' || column.id === 'actions') return null;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded text-primary h-3.5 w-3.5"
                      />
                      <span className="capitalize">{column.id.replace(/_/g, ' ')}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs flex items-center gap-1.5 h-8"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-card border rounded-xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name, ID (e.g. CH-2025-0012)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Department Filter (hidden if faculty fixed) */}
          <div>
            <select
              value={department}
              disabled={isFaculty}
              onChange={(e) => { setDepartment(e.target.value as any); setPage(1); }}
              className="w-full h-8 rounded-md border bg-background px-2 text-xs text-foreground"
            >
              <option value="ALL">All Departments</option>
              {(['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] as Department[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Backlog Filter */}
          <div>
            <select
              value={backlogs}
              onChange={(e) => { setBacklogs(e.target.value as any); setPage(1); }}
              className="w-full h-8 rounded-md border bg-background px-2 text-xs text-foreground"
            >
              <option value="ALL">All Backlog Status</option>
              <option value="CLEAN">Clean (0 Arrears)</option>
              <option value="HAS_BACKLOGS">Has Backlogs (1+)</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value as any); setPage(1); }}
              className="w-full h-8 rounded-md border bg-background px-2 text-xs text-foreground"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="AT_RISK">At-Risk (Prob &lt; 40%)</option>
              <option value="SAFE">Safe (Prob &ge; 40%)</option>
            </select>
          </div>

          {/* Placement Status */}
          <div>
            <select
              value={placed}
              onChange={(e) => { setPlaced(e.target.value as any); setPage(1); }}
              className="w-full h-8 rounded-md border bg-background px-2 text-xs text-foreground"
            >
              <option value="ALL">All Placement Status</option>
              <option value="PLACED">Placed</option>
              <option value="NOT_PLACED">In Process</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">Filters active</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </Button>
          </div>
        )}
      </div>

      {/* TanStack Table Container */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/40 text-muted-foreground">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 font-semibold tracking-wider text-[11px]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(pageSize)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={columns.length} className="p-4 bg-muted/10 h-10" />
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-muted-foreground">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedStudent(row.original);
                      setDrawerOpen(true);
                    }}
                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-style Pagination Footer */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 rounded border bg-background px-2 text-xs"
            >
              {[10, 20, 50].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="ml-2">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="tabular-nums">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <StudentDetailDrawer
        student={selectedStudent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNoteAdded={fetchStudents}
      />
    </div>
  );
};

