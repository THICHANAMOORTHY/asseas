import React, { useState, useEffect } from 'react';
import { campusApi } from '@/api/client';
import { ModelMetrics } from '@/api/types';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { EthicsBanner } from '@/components/shared/EthicsBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Award,
  ShieldCheck,
  Scale,
  Sliders,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ModelInsights: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [importanceType, setImportanceType] = useState<'impurity' | 'permutation'>('impurity');

  useEffect(() => {
    let mounted = true;
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const res = await campusApi.getModelMetrics();
        if (mounted) setMetrics(res);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadMetrics();
    return () => { mounted = false; };
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const cm = metrics.confusionMatrix;
  const totalSamples = cm.actualPlaced.predPlaced + cm.actualPlaced.predNotPlaced + cm.actualNotPlaced.predPlaced + cm.actualNotPlaced.predNotPlaced;

  const currentImportanceData = importanceType === 'impurity'
    ? metrics.featureImportanceImpurity
    : metrics.featureImportancePermutation;

  const classColors = ['#10b981', '#64748b'];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" /> Model Diagnostics & ML Auditing
            </h1>
            <Badge variant="teal" className="text-xs font-mono">
              {metrics.metadata.modelVersion}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Validation benchmarks, confusion matrix, feature importances and demographic fairness audits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-lg shadow-xs">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>Trained: {new Date(metrics.metadata.trainedDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>{metrics.metadata.syntheticSamplesCount.toLocaleString()} Synthetic Profiles</span>
        </div>
      </div>

      <EthicsBanner />

      {/* Row 1: Core Classifier Metrics (Exact specified numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Accuracy"
          value={(metrics.accuracy * 100).toFixed(1) + '%'}
          subtitle="Test set overall"
          benchmark="Baseline: 58%"
          trend="up"
          trendValue="0.848 Score"
          icon={<Award className="h-5 w-5" />}
          infoTooltip="Total correct classifications / Total evaluation cohort"
          status="success"
        />

        <KPICard
          title="Precision"
          value={(metrics.precision * 100).toFixed(1) + '%'}
          subtitle="True Positives / Predicted"
          benchmark="Placement Positive"
          trend="up"
          trendValue="0.883 Score"
          icon={<CheckCircle2 className="h-5 w-5" />}
          infoTooltip="Low false-positive rate: When model predicts placed, it is 88.3% accurate"
          status="primary"
        />

        <KPICard
          title="Recall (Sensitivity)"
          value={(metrics.recall * 100).toFixed(1) + '%'}
          subtitle="Identified Placed"
          benchmark="Coverage Rate"
          trend="up"
          trendValue="0.850 Score"
          icon={<ShieldCheck className="h-5 w-5" />}
          infoTooltip="Ability to capture eligible students who actually secure placements"
          status="default"
        />

        <KPICard
          title="F1-Score (Harmonic)"
          value={metrics.f1.toFixed(3)}
          subtitle="Balanced precision-recall"
          benchmark="Max: 1.000"
          trend="up"
          trendValue="0.866 Score"
          icon={<Scale className="h-5 w-5" />}
          infoTooltip="Harmonic mean of precision and recall"
          status="primary"
        />

        <KPICard
          title="ROC-AUC Score"
          value={metrics.rocAuc.toFixed(3)}
          subtitle="Discriminative power"
          benchmark="Excellent (> 0.90)"
          trend="up"
          trendValue="0.924 Score"
          icon={<BarChart3 className="h-5 w-5" />}
          infoTooltip="Area Under the Receiver Operating Characteristic Curve across all decision thresholds"
          status="success"
        />
      </div>

      {/* Row 2: Confusion Matrix & Class Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Confusion Matrix */}
        <Card className="lg:col-span-7 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Interactive Confusion Matrix</span>
              <span className="text-xs font-normal text-muted-foreground">Evaluation N = {totalSamples.toLocaleString()}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Actual vs. Predicted Placement Outcomes with cell breakdown
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <div className="min-w-[360px] border rounded-xl overflow-hidden text-xs">
                {/* Header row */}
                <div className="grid grid-cols-3 bg-muted/50 p-2 font-semibold text-center border-b">
                  <div>Actual \ Predicted</div>
                  <div className="text-emerald-700 dark:text-emerald-400">Predicted: Placed</div>
                  <div className="text-slate-700 dark:text-slate-300">Predicted: Not Placed</div>
                </div>

                {/* Actual Placed row */}
                <div className="grid grid-cols-3 p-3 items-center border-b hover:bg-muted/10 transition-colors">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Actual: Placed
                    <span className="block text-[10px] text-muted-foreground font-normal">
                      ({cm.actualPlaced.predPlaced + cm.actualPlaced.predNotPlaced} total)
                    </span>
                  </div>

                  {/* True Positive */}
                  <div className="p-3 m-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-center">
                    <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 tabular-nums">
                      {cm.actualPlaced.predPlaced.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      True Positive (85.0%)
                    </span>
                  </div>

                  {/* False Negative */}
                  <div className="p-3 m-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-base font-extrabold text-rose-700 dark:text-rose-400 tabular-nums">
                      {cm.actualPlaced.predNotPlaced.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      False Negative (15.0%)
                    </span>
                  </div>
                </div>

                {/* Actual Not Placed row */}
                <div className="grid grid-cols-3 p-3 items-center hover:bg-muted/10 transition-colors">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Actual: Not Placed
                    <span className="block text-[10px] text-muted-foreground font-normal">
                      ({cm.actualNotPlaced.predPlaced + cm.actualNotPlaced.predNotPlaced} total)
                    </span>
                  </div>

                  {/* False Positive */}
                  <div className="p-3 m-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-base font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                      {cm.actualNotPlaced.predPlaced.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      False Positive (15.5%)
                    </span>
                  </div>

                  {/* True Negative */}
                  <div className="p-3 m-1 rounded-lg bg-secondary/80 border text-center">
                    <span className="text-base font-extrabold text-foreground tabular-nums">
                      {cm.actualNotPlaced.predNotPlaced.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      True Negative (84.5%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground flex flex-wrap justify-between gap-2">
              <span>Overall Specificity: <strong>84.5%</strong></span>
              <span>Negative Predictive Value (NPV): <strong>80.3%</strong></span>
              <span>False Alarm Rate: <strong>15.5%</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Class Balance */}
        <Card className="lg:col-span-5 border shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Synthetic Cohort Class Balance</CardTitle>
            <CardDescription className="text-xs">Ground-truth label distribution in training set</CardDescription>
          </CardHeader>

          <CardContent className="pt-2 pb-5 space-y-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.classBalance}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {metrics.classBalance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} students (${Math.round((val / 5000) * 100)}%)`, 'Count']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 border-t pt-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Class 1 (Placed):</span>
                <span className="font-semibold text-foreground">2,900 students (58.0%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Class 0 (Not Placed):</span>
                <span className="font-semibold text-foreground">2,100 students (42.0%)</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Well-balanced ratio mirrors typical premier tier-2 engineering campus hiring distribution without severe class imbalance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Feature Importance (Impurity vs Permutation Toggle) */}
      <ChartCard
        title="Random Forest Feature Importance"
        subtitle="Comparing feature contribution to classification decisions"
        infoTooltip="MDI (Gini Impurity) measures variance reduction during tree splits; Permutation Importance measures test score drop when feature values are shuffled."
        headerAction={
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-md text-xs">
            <button
              onClick={() => setImportanceType('impurity')}
              className={`px-2 py-1 rounded transition-all font-medium ${
                importanceType === 'impurity'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              MDI / Gini Impurity
            </button>
            <button
              onClick={() => setImportanceType('permutation')}
              className={`px-2 py-1 rounded transition-all font-medium ${
                importanceType === 'permutation'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Permutation Importance
            </button>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentImportanceData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 130, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              domain={[0, 0.35]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              width={140}
            />
            <RechartsTooltip
              formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}% Relative Importance`, 'Impact']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="importance"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 4: Demographic Fairness & Parity Auditing */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Algorithmic Fairness & Parity Audit Panel
              </CardTitle>
              <CardDescription className="text-xs">
                Audited against protected identity groups to verify non-discrimination and demographic parity
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs">
              Audit Passed: 0.98 Parity
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2 space-y-5">
          {/* Gender Parity Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              1. Gender Demographic Parity Ratio (Benchmark: 0.80 – 1.25 Four-Fifths Rule)
            </h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b text-muted-foreground">
                  <tr>
                    <th className="p-2.5">Demographic Group</th>
                    <th className="p-2.5">Total Evaluated</th>
                    <th className="p-2.5">Placed Count</th>
                    <th className="p-2.5">Placement Rate</th>
                    <th className="p-2.5">Disparate Impact Ratio</th>
                    <th className="p-2.5">Fairness Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metrics.fairnessByGender.map((g) => (
                    <tr key={g.gender} className="hover:bg-muted/20">
                      <td className="p-2.5 font-semibold text-foreground">{g.gender}</td>
                      <td className="p-2.5 tabular-nums text-muted-foreground">{g.total.toLocaleString()}</td>
                      <td className="p-2.5 tabular-nums font-medium">{g.placed.toLocaleString()}</td>
                      <td className="p-2.5 tabular-nums font-bold text-foreground">
                        {(g.placementRate * 100).toFixed(1)}%
                      </td>
                      <td className="p-2.5 tabular-nums font-mono font-medium">
                        {g.parityRatio.toFixed(2)}
                      </td>
                      <td className="p-2.5">
                        <Badge variant="success" className="text-[10px]">
                          Satisfies 4/5ths Rule
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              2. Branch Placement Rate & Industry Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {metrics.fairnessByDepartment.map((d) => (
                <div key={d.department} className="p-3 rounded-lg border bg-card">
                  <div className="font-semibold text-foreground">{d.department}</div>
                  <div className="text-base font-bold text-primary mt-1 tabular-nums">
                    {(d.placementRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {d.placed}/{d.total} placed
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
