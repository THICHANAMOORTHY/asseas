import React, { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { campusApi } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UploadCloud,
  ShieldCheck,
  Server,
  Layers,
  KeyRound,
  ExternalLink,
  Table,
} from 'lucide-react';

export const SupabaseCloudHub: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ count?: number; error?: string } | null>(null);
  const [liveTableCounts, setLiveTableCounts] = useState<{
    students?: number;
    predictions?: number;
    notes?: number;
  }>({});

  const testConnection = async () => {
    setIsChecking(true);
    try {
      const res = await checkSupabaseConnection();
      setConnectionStatus(res);

      // Check student table count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      const { count: predCount } = await supabase
        .from('prediction_logs')
        .select('*', { count: 'exact', head: true });
      const { count: noteCount } = await supabase
        .from('mentoring_notes')
        .select('*', { count: 'exact', head: true });

      setLiveTableCounts({
        students: studentCount || 0,
        predictions: predCount || 0,
        notes: noteCount || 0,
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await campusApi.seedSupabaseDatabase();
      setSyncResult(res);
      await testConnection();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Cloud className="h-6 w-6 text-primary" /> Supabase Cloud Database Console
            </h1>
            <Badge variant="teal" className="text-xs font-mono">
              Project: avvaxbrkqjahuwjcvbkm
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time PostgreSQL connection status, cloud table synchronization, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={isChecking}
            className="text-xs flex items-center gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="text-xs flex items-center gap-1.5 h-8 font-semibold shadow-xs"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isSyncing ? 'Syncing Records...' : 'Push 360 Students to Cloud'}</span>
          </Button>
        </div>
      </div>

      {/* Row 1: Connection Health & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Status card */}
        <Card className="p-4 border shadow-xs sm:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Cloud Connection Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                {connectionStatus?.connected ? (
                  <Badge variant="success" className="text-xs flex items-center gap-1 py-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected & Active</span>
                  </Badge>
                ) : (
                  <Badge variant="danger" className="text-xs flex items-center gap-1 py-0.5">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Connecting...</span>
                  </Badge>
                )}
              </div>
            </div>
            <Server className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            {connectionStatus?.message || 'Testing connection with endpoint...'}
          </div>
        </Card>

        {/* Cloud Student Records */}
        <Card className="p-4 border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cloud Students</span>
            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {liveTableCounts.students !== undefined ? liveTableCounts.students : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Stored in public.students</p>
        </Card>

        {/* Cloud Predictions Logged */}
        <Card className="p-4 border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Simulation Logs</span>
            <Table className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {liveTableCounts.predictions !== undefined ? liveTableCounts.predictions : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">In public.prediction_logs</p>
        </Card>
      </div>

      {/* Sync Result Feedback */}
      {syncResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            syncResult.count && syncResult.count > 0
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncResult.count && syncResult.count > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <strong className="block">
                {syncResult.count && syncResult.count > 0
                  ? `Successfully Synced ${syncResult.count} Students to Supabase Cloud!`
                  : 'Supabase Cloud Sync Failed'}
              </strong>
              {syncResult.error && (
                <span className="text-[11px] opacity-90">{syncResult.error}</span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            className="h-7 text-xs bg-background text-foreground"
          >
            Refresh Counts
          </Button>
        </div>
      )}

      {/* Database Schema & Instructions Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 border shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Active Cloud Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Credentials and endpoints configured in your environment
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="p-3 rounded-lg border bg-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Supabase Project Endpoint:</span>
                <span className="font-mono font-semibold text-foreground">
                  https://avvaxbrkqjahuwjcvbkm.supabase.co
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Key Type:</span>
                <Badge variant="teal" className="text-[10px]">
                  Publishable (Anon) Key Configured
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Persistence:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Auto-sync on predictions & notes enabled
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-foreground text-xs">How Data Synchronization Works:</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed text-xs">
                <li>
                  <strong className="text-foreground">Student Directory:</strong> Automatically loads from Supabase when records exist in <code>public.students</code>, with fallback to the local synthetic dataset.
                </li>
                <li>
                  <strong className="text-foreground">Prediction Logs:</strong> Every time a user executes or adjusts a prediction in the Prediction Studio, the simulation parameters and SHAP outputs are logged to <code>public.prediction_logs</code>.
                </li>
                <li>
                  <strong className="text-foreground">Mentoring Notes:</strong> Counseling feedback added by faculty coordinators directly writes to <code>public.mentoring_notes</code>.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick SQL Setup Helper */}
        <Card className="lg:col-span-5 border shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              SQL Schema Initialization
            </CardTitle>
            <CardDescription className="text-xs">
              Apply the required database tables to your Supabase project
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-3 text-xs text-muted-foreground">
            <p>
              The complete PostgreSQL migration script is pre-authored in{' '}
              <strong className="text-foreground font-mono">supabase/schema.sql</strong>.
            </p>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1 text-foreground">
              <span className="font-bold text-primary block">3-Step Quick Setup:</span>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                <li>Open your <strong>Supabase Dashboard</strong> (`avvaxbrkqjahuwjcvbkm`).</li>
                <li>Navigate to the <strong>SQL Editor</strong> tab on the left.</li>
                <li>Paste the contents of <code>supabase/schema.sql</code> and click <strong>Run</strong>.</li>
              </ol>
            </div>

            <p className="text-[11px]">
              After running the schema script, click "Push 360 Students to Cloud" above to seed your database!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

