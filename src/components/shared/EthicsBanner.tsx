import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, HeartHandshake } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const EthicsBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <Card className="border-l-4 border-l-primary bg-primary/5 border border-primary/20 shadow-none overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Ethical Guidance: How to Read & Act on Predictions
            </h4>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 focus:outline-none"
            aria-label={expanded ? 'Collapse guidelines' : 'Expand guidelines'}
          >
            <span>{expanded ? 'Hide' : 'Read Guidance'}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Not a Placement Guarantee</strong>
                Probabilities reflect predictive correlations modeled by the Random Forest placement classification system. They never guarantee hiring outcomes nor preclude students from opportunities.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Demographic Neutrality</strong>
                Gender and protected identities are strictly excluded from recommendation generation. Recommendations focus purely on modifiable skills, projects, and backlog clearance.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Constructive Intervention</strong>
                Faculty mentors use this data exclusively to provide timely tutoring, mock interviews, and career counseling to students with lower baseline probabilities.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

