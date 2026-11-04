import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  infoTooltip?: string;
  onExportCsv?: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  infoTooltip,
  onExportCsv,
  headerAction,
  children,
  className,
  minHeight = 'h-[320px]',
}) => {
  return (
    <Card className={cn("flex flex-col border shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <CardTitle>{title}</CardTitle>
            {infoTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`About ${title}`}
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
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerAction}
          {onExportCsv && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
              title="Export chart data as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1 pb-4">
        <div className={cn("w-full", minHeight)}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

