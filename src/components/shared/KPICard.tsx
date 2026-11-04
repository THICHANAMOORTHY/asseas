import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  benchmark?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  infoTooltip?: string;
  status?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  benchmark,
  trend,
  trendValue,
  icon,
  infoTooltip,
  status = 'default',
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden relative border", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
              </span>
              {infoTooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`More information about ${title}`}
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{infoTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground">
                {value}
              </span>
            </div>
          </div>

          {icon && (
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border",
              status === 'primary' && "bg-primary/10 text-primary border-primary/20",
              status === 'success' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              status === 'warning' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              status === 'danger' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
              status === 'default' && "bg-secondary text-muted-foreground border-border"
            )}>
              {icon}
            </div>
          )}
        </div>

        {(benchmark || subtitle || trendValue) && (
          <div className="mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
            {subtitle && <span>{subtitle}</span>}
            {benchmark && <span className="font-medium text-foreground/80">{benchmark}</span>}

            {trend && trendValue && (
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
                {trend === 'neutral' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className={cn(
                  "font-medium",
                  trend === 'up' && "text-emerald-600 dark:text-emerald-400",
                  trend === 'down' && "text-rose-600 dark:text-rose-400"
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

