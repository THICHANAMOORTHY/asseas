import React, { useState, useEffect } from 'react';
import {
  QuizQuestion,
  QuizResult,
  generateAssessmentQuiz,
  evaluateQuizSubmission,
} from '@/api/quizService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  Target,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentQuizModalProps {
  open: boolean;
  onClose: () => void;
  department: string;
  currentAptitude: number;
  currentCommunication: number;
  onApplyScores: (measuredAptitude: number, measuredCommunication: number) => void;
}

type Stage = 'setup' | 'quiz' | 'report';

export const AssessmentQuizModal: React.FC<AssessmentQuizModalProps> = ({
  open,
  onClose,
  department,
  currentAptitude,
  currentCommunication,
  onApplyScores,
}) => {
  const [stage, setStage] = useState<Stage>('setup');
  const [questionCount, setQuestionCount] = useState<10 | 15>(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 mins default
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showReviewList, setShowReviewList] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (stage !== 'quiz' || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, timeLeftSeconds]);

  if (!open) return null;

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const generated = await generateAssessmentQuiz(department, questionCount);
      setQuestions(generated);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeftSeconds(questionCount === 10 ? 600 : 900); // 10 mins or 15 mins
      setStage('quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleFinishQuiz = () => {
    const result = evaluateQuizSubmission(questions, answers);
    setQuizResult(result);
    setStage('report');
  };

  const handleApplyToModel = () => {
    if (quizResult) {
      onApplyScores(
        quizResult.measuredAptitudeScore,
        quizResult.measuredCommunicationScore
      );
      onClose();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-white border border-[#E8E5F5] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header with EASA Royal Purple */}
        <div className="bg-[#29136F] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/easa_logo.png" alt="EASA Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#FFC20E] tracking-wide">
                  CampusHire AI Assessment Quiz
                </span>
                <Badge className="bg-[#381A91] text-white text-[10px] font-mono">
                  Aptitude & Soft Skills
                </Badge>
              </div>
              <p className="text-[11px] text-white/80">
                EASA College Placement Diagnostic Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============================================================== */}
          {/* STAGE 1: ASSESSMENT SETUP */}
          {/* ============================================================== */}
          {stage === 'setup' && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-[#E8E5F5] text-[#29136F] flex items-center justify-center mx-auto shadow-xs">
                  <Zap className="h-7 w-7 text-[#29136F]" />
                </div>
                <h3 className="text-lg font-bold text-[#1D1745]">
                  AI Placement Skills Assessment
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate your quantitative aptitude and soft skill maturity through calibrated
                  workplace scenarios. Your measured scores will feed directly into the Random Forest
                  placement predictor.
                </p>
              </div>

              {/* Baseline Comparison Card */}
              <div className="p-4 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Current Aptitude Score
                  </span>
                  <span className="text-xl font-extrabold text-[#29136F] font-mono">
                    {currentAptitude}/100
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Model Weight: ~16.9%</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Current Soft Skills / Comm.
                  </span>
                  <span className="text-xl font-extrabold text-[#29136F] font-mono">
                    {currentCommunication}/100
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Model Weight: ~6.4%</span>
                </div>
              </div>

              {/* Question Count Option */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1D1745] block">
                  Select Evaluation Depth:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(10)}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      questionCount === 10
                        ? 'border-[#29136F] bg-[#29136F]/5 ring-1 ring-[#29136F]'
                        : 'border-[#E8E5F5] hover:border-gray-300 bg-white'
                    )}
                  >
                    <div className="font-bold text-xs text-[#1D1745]">10 Questions (Standard)</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      5 Aptitude + 5 Soft Skills • 10 Mins
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionCount(15)}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      questionCount === 15
                        ? 'border-[#29136F] bg-[#29136F]/5 ring-1 ring-[#29136F]'
                        : 'border-[#E8E5F5] hover:border-gray-300 bg-white'
                    )}
                  >
                    <div className="font-bold text-xs text-[#1D1745]">15 Questions (Deep Diagnostic)</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      8 Aptitude + 7 Soft Skills • 15 Mins
                    </div>
                  </button>
                </div>
              </div>

              {/* Test Instructions */}
              <div className="p-3.5 rounded-xl border border-[#E8E5F5] bg-white text-xs space-y-1.5 text-muted-foreground">
                <span className="font-semibold text-[#1D1745] block flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#168B55]" /> Assessment Instructions
                </span>
                <p>• Aptitude questions feature a single correct answer with numerical verification.</p>
                <p>• Soft Skills questions assess workplace situational judgment and behavioral maturity.</p>
                <p>• You may jump between questions and change answers anytime before submission.</p>
              </div>

              {/* Start CTA */}
              <Button
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="w-full bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-sm h-11 rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Generating Assessment Questions...</span>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Start Assessment Test</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: ACTIVE TEST-TAKING */}
          {/* ============================================================== */}
          {stage === 'quiz' && currentQ && (
            <div className="space-y-5">
              {/* Top Controls: Timer + Progress */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E5F5]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#1D1745]">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <Badge
                    variant={currentQ.type === 'aptitude' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {currentQ.subCategory}
                  </Badge>
                </div>

                {/* Timer */}
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border',
                    timeLeftSeconds < 120
                      ? 'bg-rose-50 text-[#D94343] border-rose-200 animate-pulse'
                      : 'bg-[#F7F6FC] text-[#29136F] border-[#E8E5F5]'
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </div>
              </div>

              {/* Progress Bar & Jump Pills */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-[#E8E5F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#29136F] rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Jump Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          'h-7 w-7 rounded-lg text-xs font-mono font-bold transition-all shrink-0',
                          isCurrent
                            ? 'bg-[#29136F] text-[#FFC20E] ring-2 ring-[#FFC20E]'
                            : isAnswered
                            ? 'bg-[#168B55] text-white'
                            : 'bg-[#F7F6FC] text-muted-foreground border border-[#E8E5F5] hover:bg-[#E8E5F5]'
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-2xl bg-[#F7F6FC] border border-[#E8E5F5] space-y-4">
                <p className="text-sm font-semibold text-[#1D1745] leading-relaxed">
                  {currentQ.question}
                </p>

                {/* Option Cards (A, B, C, D) */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={cn(
                          'p-3.5 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-all',
                          isSelected
                            ? 'bg-[#29136F] text-white border-[#29136F] shadow-sm'
                            : 'bg-white text-[#1D1745] border-[#E8E5F5] hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <span
                          className={cn(
                            'h-6 w-6 rounded-lg font-bold flex items-center justify-center shrink-0 font-mono text-xs',
                            isSelected
                              ? 'bg-[#FFC20E] text-[#29136F]'
                              : 'bg-[#F7F6FC] text-muted-foreground border border-[#E8E5F5]'
                          )}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 leading-relaxed font-medium">{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                      }
                      className="bg-[#29136F] text-white hover:bg-[#381A91] text-xs flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleFinishQuiz}
                      className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs flex items-center gap-1.5 px-5 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Submit Assessment</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 3: DIAGNOSTIC REPORT */}
          {/* ============================================================== */}
          {stage === 'report' && quizResult && (
            <div className="space-y-6 animate-in fade-in-0">
              <div className="text-center space-y-1.5">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-[#168B55] flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-[#1D1745]">
                  Diagnostic Assessment Complete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your assessment results have been calculated from {quizResult.totalQuestions} validated
                  questions.
                </p>
              </div>

              {/* Measured Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aptitude Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1745] flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-[#29136F]" /> Measured Aptitude Score
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {quizResult.aptitudeCorrect}/{quizResult.aptitudeTotal} Correct
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#29136F] font-mono">
                      {quizResult.measuredAptitudeScore}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">/ 100</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-[#E8E5F5] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        quizResult.measuredAptitudeScore >= 75
                          ? 'bg-[#168B55]'
                          : quizResult.measuredAptitudeScore >= 50
                          ? 'bg-[#FFC20E]'
                          : 'bg-[#D94343]'
                      )}
                      style={{ width: `${quizResult.measuredAptitudeScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Previous Baseline: {currentAptitude}/100 •{' '}
                    <strong
                      className={
                        quizResult.measuredAptitudeScore >= currentAptitude
                          ? 'text-[#168B55]'
                          : 'text-[#D94343]'
                      }
                    >
                      {quizResult.measuredAptitudeScore >= currentAptitude ? '+' : ''}
                      {quizResult.measuredAptitudeScore - currentAptitude} Delta
                    </strong>
                  </span>
                </div>

                {/* Soft Skills Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E5F5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1745] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#29136F]" /> Measured Soft Skills
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {quizResult.measuredSoftSkillsRating} / 5.0 Rating
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#29136F] font-mono">
                      {quizResult.measuredCommunicationScore}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">/ 100</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-[#E8E5F5] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        quizResult.measuredCommunicationScore >= 75
                          ? 'bg-[#168B55]'
                          : quizResult.measuredCommunicationScore >= 50
                          ? 'bg-[#FFC20E]'
                          : 'bg-[#D94343]'
                      )}
                      style={{ width: `${quizResult.measuredCommunicationScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Normalized Communication Metric •{' '}
                    <strong
                      className={
                        quizResult.measuredCommunicationScore >= currentCommunication
                          ? 'text-[#168B55]'
                          : 'text-[#D94343]'
                      }
                    >
                      {quizResult.measuredCommunicationScore >= currentCommunication ? '+' : ''}
                      {quizResult.measuredCommunicationScore - currentCommunication} Delta
                    </strong>
                  </span>
                </div>
              </div>

              {/* Strengths & Weaknesses Chips */}
              <div className="p-4 rounded-2xl bg-[#F7F6FC] border border-[#E8E5F5] space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#1D1745] block mb-1.5">
                    Demonstrated Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quizResult.strengths.map((str, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#168B55] border border-emerald-200 font-semibold text-[11px]"
                      >
                        ✓ {str}
                      </span>
                    ))}
                  </div>
                </div>

                {quizResult.areasToImprove.length > 0 && (
                  <div>
                    <span className="font-bold text-[#1D1745] block mb-1.5">
                      Priority Growth Areas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quizResult.areasToImprove.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-rose-50 text-[#D94343] border border-rose-200 font-semibold text-[11px]"
                        >
                          ! {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Toggle */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowReviewList(!showReviewList)}
                  className="text-xs text-[#29136F] font-bold hover:underline flex items-center gap-1"
                >
                  <span>{showReviewList ? 'Hide' : 'Review'} Question Explanations ({quizResult.questions.length})</span>
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showReviewList ? 'rotate-90' : '')} />
                </button>

                {showReviewList && (
                  <div className="space-y-3 max-h-60 overflow-y-auto p-3 border border-[#E8E5F5] rounded-xl bg-white text-xs divide-y divide-[#E8E5F5]">
                    {quizResult.questions.map((q, idx) => {
                      const userPick = quizResult.userAnswers[q.id];
                      const isCorrect = q.type === 'aptitude' ? userPick === q.correctIndex : true;

                      return (
                        <div key={q.id} className="pt-2 first:pt-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1D1745]">
                              {idx + 1}. {q.subCategory}
                            </span>
                            <Badge
                              variant={isCorrect ? 'success' : 'danger'}
                              className="text-[9px]"
                            >
                              {q.type === 'aptitude'
                                ? isCorrect
                                  ? 'Correct'
                                  : 'Incorrect'
                                : 'Evaluated'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-[11px]">{q.question}</p>
                          <p className="text-[11px] text-[#29136F] font-medium bg-[#F7F6FC] p-2 rounded-lg">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Primary Action Button: Apply to Prediction Model */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStage('setup')}
                  className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake Test</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleApplyToModel}
                  className="w-full sm:flex-1 bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <BrainCircuit className="h-4 w-4" />
                  <span>Apply Measured Scores to Model & Predict</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

