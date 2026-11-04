import React from 'react';
import { cn } from '@/lib/utils';
import { ConfidenceBand } from '@/api/types';

interface ReadinessGaugeProps {
  score: number; // 0 to 100
  size?: number; // default width 210
  strokeWidth?: number; // default 13
  label?: string;
  confidenceBand?: ConfidenceBand;
  confidenceInterval?: [number, number];
  placementTier?: string;
  delta?: number;
  showText?: boolean;
  className?: string;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score,
  size = 210,
  strokeWidth = 13,
  label = 'Estimated Placement Probability',
  confidenceBand,
  confidenceInterval,
  placementTier,
  delta,
  showText = true,
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Semicircle geometry calculations
  const width = size;
  const radius = (width - strokeWidth * 2) / 2 - 2;
  const cx = width / 2;
  const cy = radius + strokeWidth + 6;
  const height = cy + 6;

  // Arc length for 180-degree semicircle = PI * R
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength - (arcLength * clampedScore) / 100;

  // Path from left (cx - radius, cy) arching over to right (cx + radius, cy)
  const pathD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Semantic color and badge tokens matching EASA brand
  let gradientId = 'gauge-emerald';
  let strokeColor = '#168B55';
  let badgeClasses = 'bg-emerald-500/10 text-[#168B55] border-emerald-500/30 dark:bg-emerald-500/20';
  let statusText = 'Strong Placement Candidate';

  if (clampedScore < 45) {
    gradientId = 'gauge-rose';
    strokeColor = '#D94343';
    badgeClasses = 'bg-rose-500/10 text-[#D94343] border-rose-500/30 dark:bg-rose-500/20';
    statusText = 'At-Risk / Coaching Required';
  } else if (clampedScore < 68) {
    gradientId = 'gauge-amber';
    strokeColor = '#FFC20E';
    badgeClasses = 'bg-amber-500/10 text-amber-700 dark:text-[#FFC20E] border-amber-500/30 dark:bg-amber-500/20';
    statusText = 'Moderate Placement Readiness';
  }

  // Margin of error percentage calculation if confidence interval is given
  const marginPct = confidenceInterval
    ? Math.round((confidenceInterval[1] - confidenceInterval[0]) * 50)
    : 5;

  return (
    <div className={cn('flex flex-col items-center justify-center select-none w-full', className)}>
      {/* Semicircle SVG Dome Container */}
      <div className="relative flex justify-center" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          role="meter"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <defs>
            {/* Luminous High-Contrast Gradients */}
            <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#168B55" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC20E" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D94343" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>

            {/* Crisp drop shadow without muddy blur */}
            <filter id="gauge-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor={strokeColor} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track (Muted Grey Semicircle) */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="opacity-75 dark:opacity-30"
          />

          {/* Calibrated Ticks along the outer perimeter (0%, 50%, 100%) */}
          {/* 50% Top Center Tick */}
          <line
            x1={cx}
            y1={cy - radius - strokeWidth / 2 - 1}
            x2={cx}
            y2={cy - radius - strokeWidth / 2 - 5}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="opacity-60"
          />

          {/* Active Gradient Arc with Smooth Easing */}
          {clampedScore > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${arcLength}`}
              strokeDashoffset={dashOffset}
              filter="url(#gauge-glow)"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Subtle tick markers at base 0% and 100% */}
          <text
            x={cx - radius}
            y={cy + 13}
            textAnchor="middle"
            className="text-[9px] font-mono fill-muted-foreground opacity-60 font-semibold"
          >
            0%
          </text>
          <text
            x={cx}
            y={cy - radius - 8}
            textAnchor="middle"
            className="text-[9px] font-mono fill-muted-foreground opacity-60 font-semibold"
          >
            50%
          </text>
          <text
            x={cx + radius}
            y={cy + 13}
            textAnchor="middle"
            className="text-[9px] font-mono fill-muted-foreground opacity-60 font-semibold"
          >
            100%
          </text>
        </svg>

        {/* Center Numbers (Zero Collision: Clean Hero Metric with Subtitle) */}
        <div
          className="absolute inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none"
          style={{ top: strokeWidth, height: radius }}
        >
          {/* Main Number & Percentage */}
          <div className="flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-foreground drop-shadow-sm leading-none">
              {Math.round(clampedScore)}
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-muted-foreground ml-0.5">%</span>
          </div>

          {/* Compact, narrow sublabel that cannot collide */}
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 mt-1">
            Readiness
          </span>
        </div>
      </div>

      {/* Badges & Text (Located SAFELY below the SVG baseline with zero collision risk) */}
      {showText && (
        <div className="text-center mt-3 space-y-2 w-full max-w-[280px]">
          {/* Status Badge + Confidence Pill */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-colors',
                badgeClasses
              )}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-xs animate-pulse"
                style={{ backgroundColor: strokeColor }}
              />
              <span>{placementTier || statusText}</span>
            </div>

            {confidenceBand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/80 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border border-border/60 shadow-2xs">
                <span>{confidenceBand} Confidence</span>
                <span className="font-mono text-[9px] opacity-80">({marginPct ? `±${marginPct}%` : 'High'})</span>
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-medium pt-0.5">{label}</p>

          {delta !== undefined && delta !== 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums bg-secondary/80 border">
              {delta > 0 ? (
                <span className="text-[#168B55] flex items-center gap-0.5">
                  ▲ +{delta.toFixed(1)}% Shift
                </span>
              ) : (
                <span className="text-[#D94343] flex items-center gap-0.5">
                  ▼ {delta.toFixed(1)}% Shift
                </span>
              )}
              <span className="text-muted-foreground font-normal text-[10px]">(vs previous step)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
