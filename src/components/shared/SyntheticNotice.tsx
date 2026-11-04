import React, { useState } from 'react';
import { AlertTriangle, Info, ShieldCheck, Database, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const SyntheticNoticePill: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
        title="Click to view Synthetic Data & Model Transparency Notice"
        aria-label="Synthetic Data Notice"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="hidden sm:inline">Synthetic Data Notice</span>
        <span className="sm:hidden">Synthetic</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <Database className="h-5 w-5" />
              <DialogTitle>Educational & Synthetic Data Transparency</DialogTitle>
            </div>
            <DialogDescription>
              Notice on model origin, synthetic records, and ethical usage in university placement systems.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-foreground/90 mt-2">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Synthetic & Educational Benchmark Only
              </p>
              <p className="text-muted-foreground">
                All records, student demographics, assessment scores, and outcome probabilities in CampusHire are generated from a controlled <strong>synthetic simulation dataset of 5,000 engineering students</strong>. No private or real student educational records are stored or exposed.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Ethical Guardrails & Model Design</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                <li><strong className="text-foreground">Predictions are Not Guarantees:</strong> Probabilities reflect statistical readiness cohorts to identify coaching opportunities early, never to exclude or penalize students.</li>
                <li><strong className="text-foreground">Demographic Neutrality:</strong> Protected attributes (Gender) are strictly excluded from recommendation heuristics and score penalties. Fairness metrics are audited continuously.</li>
                <li><strong className="text-foreground">Actionable Levers:</strong> All driving factors prioritize modifiable student actions (backlog clearance, programming drills, mock interviews) rather than unchangeable past grades.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>Model: Random Forest (v2.4.0-synthetic)</span>
              <span>ROC-AUC: 0.924 | F1: 0.866</span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setOpen(false)}>Acknowledge & Proceed</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const SyntheticBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Synthetic Educational Environment:</strong> Student records, test scores, and predictions are synthetically generated for training and demonstration. Do not treat model probabilities as placement commitments.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 dark:text-amber-400 hover:text-amber-900 ml-3 p-1"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

