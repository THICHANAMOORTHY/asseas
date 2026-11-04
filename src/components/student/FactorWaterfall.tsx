import React from 'react';
import { TopFactor } from '@/api/types';
import { TrendingUp, TrendingDown, HelpCircle, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FactorWaterfallProps {
  factors: TopFactor[];
  className?: string;
  baseRate?: number;
}

const getCategoryBadgeClass = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'technical':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
    case 'experience':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    case 'soft skills':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25';
    case 'academics':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
    default:
      return 'bg-secondary/60 text-muted-foreground border-border';
  }
};

const formatFeatureTitle = (factor: TopFactor): string => {
  if (factor.readableName) {
    // If it's the long string that gets clipped, format cleanly
    if (factor.readableName.toLowerCase().includes('industry internships')) {
      return 'Industry Internships';
    }
    return factor.readableName;
  }
  return factor.feature.replace(/_/g, ' ');
};

export const FactorWaterfall: React.FC<FactorWaterfallProps> = ({
  factors,
  className = '',
  baseRate = 0.58,
}) => {
  if (!factors || factors.length === 0) {
    return <p className="text-xs text-muted-foreground">No feature impact data available.</p>;
  }

  // Find max impact magnitude for relative bar scaling
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.25);

  return (
    <div className={cn("space-y-3.5", className)}>
      {/* Legend Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
        <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" /> Feature Driver
        </span>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shadow-xs" /> + Raised Odds
          </span>
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block shadow-xs" /> - Lowered Odds
          </span>
        </div>
      </div>

      {/* Factor Rows */}
      <div className="space-y-2.5">
        {factors.map((factor, idx) => {
          const isPos = factor.direction === 'positive' || factor.impact >= 0;
          const absImpact = Math.abs(factor.impact);
          const widthPct = Math.min(100, Math.max(8, (absImpact / maxImpact) * 100));
          const title = formatFeatureTitle(factor);

          return (
            <div key={`${factor.feature}-${idx}`} className="group p-2 rounded-lg hover:bg-secondary/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground text-xs truncate">
                    {title}
                  </span>
                  {factor.category && (
                    <span className={cn(
                      "px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md border shrink-0",
                      getCategoryBadgeClass(factor.category)
                    )}>
                      {factor.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-xs tabular-nums font-bold shrink-0">
                  {isPos ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      +{absImpact.toFixed(2)}
                      <TrendingUp className="h-3 w-3 ml-0.5" />
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center">
                      -{absImpact.toFixed(2)}
                      <TrendingDown className="h-3 w-3 ml-0.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Impact Bar with Glow */}
              <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden flex shadow-inner">
                {isPos ? (
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                    style={{ width: `${widthPct}%` }}
                  />
                ) : (
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(244,63,94,0.35)]"
                    style={{ width: `${widthPct}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cohort Baseline Subtitle */}
      <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/80">
        <span className="flex items-center gap-1">
          Baseline Cohort Rate: <strong className="text-foreground font-mono">{Math.round(baseRate * 100)}%</strong>
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
          SHAP TreeExplainer
        </span>
      </div>
    </div>
  );
};
