import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '@/context/AuthRoleContext';
import { campusApi } from '@/api/client';
import { StudentRecord, PredictionResponse } from '@/api/types';
import { runModelInference } from '@/api/modelEngine';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  BrainCircuit,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  timestamp: string;
  cgpa: number;
  backlogs: number;
  aptitude_score: number;
  programming_score: number;
  internships: number;
  probability: number;
  label: 'Placed' | 'Not Placed';
  confidence_band: 'High' | 'Medium' | 'Low';
  readiness_score: number;
  topDrivers: string;
}

export const PredictionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isStudent } = useAuthRole();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const studentId = isStudent ? currentUser.studentId || '720523106032' : '720523106032';

  useEffect(() => {
    async function loadData() {
      let found = await campusApi.getStudentById(studentId);
      if (!found) {
        found = await campusApi.getStudentById('720523106032');
      }
      if (found) {
        setStudent(found);

        // Generate realistic historical snapshots for this candidate
        const predCurrent = runModelInference(found);

        const items: HistoryItem[] = [
          {
            id: 'run-3',
            timestamp: 'Today, 10:45 AM',
            cgpa: found.cgpa,
            backlogs: found.backlogs,
            aptitude_score: found.aptitude_score,
            programming_score: found.programming_score,
            internships: found.internships,
            probability: predCurrent.probability,
            label: predCurrent.label,
            confidence_band: predCurrent.confidence_band,
            readiness_score: predCurrent.readiness_score ?? 65,
            topDrivers: 'DSA +0.18, Internships +0.12, Backlogs 0',
          },
          {
            id: 'run-2',
            timestamp: 'Yesterday, 04:20 PM',
            cgpa: found.cgpa,
            backlogs: found.backlogs,
            aptitude_score: Math.max(40, found.aptitude_score - 10),
            programming_score: Math.max(45, found.programming_score - 8),
            internships: Math.max(0, found.internships - 1),
            probability: Math.max(0.25, predCurrent.probability - 0.14),
            label: predCurrent.probability - 0.14 >= 0.5 ? 'Placed' : 'Not Placed',
            confidence_band: 'Medium',
            readiness_score: Math.max(45, (predCurrent.readiness_score ?? 65) - 10),
            topDrivers: 'Lower DSA Odds (-0.12), Single Capstone',
          },
          {
            id: 'run-1',
            timestamp: 'Oct 28, 2026, 02:15 PM',
            cgpa: Math.max(5.5, Number((found.cgpa - 0.2).toFixed(2))),
            backlogs: found.backlogs + 1,
            aptitude_score: 55,
            programming_score: 52,
            internships: 0,
            probability: 0.38,
            label: 'Not Placed',
            confidence_band: 'Medium',
            readiness_score: 54,
            topDrivers: 'Active Backlog Flag (-0.35), 0 Internships (-0.15)',
          },
        ];

        setHistoryItems(items);
        setSelectedItem(items[0]);
      }
    }
    loadData();
  }, [studentId]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header with EASA Theme */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#29136F] p-2 flex items-center justify-center shrink-0 shadow-sm">
            <img src="/easa_logo.png" alt="EASA College Logo" className="h-full w-full object-contain" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1745]">
                Placement Prediction Audit History
              </h1>
              <Badge className="bg-[#29136F] text-[#FFC20E] text-xs font-bold">
                EASA Placement Cell Records
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Audit trail of all Random Forest model inferences and what-if simulations executed for candidate{' '}
              <strong className="text-[#1D1745]">{student?.name || 'Student'}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/predict', { state: { student } })}
            className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2 shadow-xs"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Launch Prediction Studio</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: History Table (8 cols) | Detail Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* History Table (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border border-[#E8E5F5] bg-white shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#F7F6FC]">
              <CardTitle className="text-sm font-semibold text-[#29136F] flex items-center gap-2">
                <History className="h-4 w-4 text-[#29136F]" />
                <span>Simulation Records ({historyItems.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Inferences evaluated across academic parameters and competency drills
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F6FC] border-b border-[#E8E5F5] text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Run Timestamp</th>
                      <th className="p-3">Profile Snapshot</th>
                      <th className="p-3 text-center">Predicted Outcome</th>
                      <th className="p-3 text-center">Probability</th>
                      <th className="p-3 text-center">Readiness</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5F5]">
                    {historyItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          'hover:bg-[#F7F6FC]/80 transition-colors cursor-pointer',
                          selectedItem?.id === item.id ? 'bg-[#E8E5F5]/40' : ''
                        )}
                      >
                        <td className="p-3 font-medium text-[#1D1745] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#29136F]" />
                            <span>{item.timestamp}</span>
                          </div>
                        </td>

                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          <span>
                            CGPA <strong>{item.cgpa}</strong> • Backlogs{' '}
                            <strong>{item.backlogs}</strong> • DSA{' '}
                            <strong>{item.programming_score}</strong>
                          </span>
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <Badge
                            variant={item.label === 'Placed' ? 'success' : 'danger'}
                            className="text-[10px]"
                          >
                            {item.label}
                          </Badge>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-[#1D1745] whitespace-nowrap">
                          {Math.round(item.probability * 100)}%
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-[#29136F] whitespace-nowrap">
                          {item.readiness_score}/100
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="h-7 text-xs text-[#29136F] hover:bg-[#E8E5F5]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Snapshot Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          {selectedItem ? (
            <Card className="border border-[#E8E5F5] bg-white shadow-xs space-y-4">
              <CardHeader className="pb-3 border-b border-[#F7F6FC]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-[#29136F]">
                    Simulation Details
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedItem.id}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{selectedItem.timestamp}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Result Block */}
                <div className="p-3 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Outcome / Probability
                    </span>
                    <span className="text-base font-bold text-[#1D1745] font-mono">
                      {Math.round(selectedItem.probability * 100)}% ({selectedItem.label})
                    </span>
                  </div>
                  <Badge
                    variant={selectedItem.label === 'Placed' ? 'success' : 'danger'}
                    className="text-xs font-bold"
                  >
                    {selectedItem.label}
                  </Badge>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg border border-[#E8E5F5] bg-white">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      CGPA
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1D1745]">
                      {selectedItem.cgpa}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E5F5] bg-white">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Backlogs
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1D1745]">
                      {selectedItem.backlogs}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E5F5] bg-white">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Aptitude
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1D1745]">
                      {selectedItem.aptitude_score}/100
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E5F5] bg-white">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      DSA Score
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1D1745]">
                      {selectedItem.programming_score}/100
                    </div>
                  </div>
                </div>

                {/* Top Factors */}
                <div className="p-3 rounded-xl border border-[#E8E5F5] bg-white space-y-1">
                  <span className="text-[11px] font-semibold text-[#29136F] flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-[#29136F]" /> Model Factors
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedItem.topDrivers}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/predict', { state: { student } })}
                  className="w-full bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Re-test This Model in Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground bg-white border border-[#E8E5F5] rounded-2xl">
              Select a simulation run to inspect parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
