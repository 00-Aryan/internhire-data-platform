'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { useNotification } from '@/shared/notifications/useNotification';

interface Question {
  id: string;
  text: string;
  options: { id: number; text: string }[];
  difficulty: string;
  questionTypeId?: string;
  type?: string;
  allowedTimeSeconds?: number | null;
}

interface AssessmentRunnerProps {
  subdomainId: string;
  subdomainName: string;
  domainName?: string;
}

export default function AssessmentRunner({ subdomainId, subdomainName, domainName }: AssessmentRunnerProps) {
  const router = useRouter();
  const { showConfirmation, hide } = useNotification();
  
  // States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> selectedOptionId
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; correctAnswers: number; totalQuestions: number } | null>(null);
  const [stage, setStage] = useState<'start' | 'resume' | 'completed' | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Reset timer when question changes
  useEffect(() => {
    const q = questions[currentIndex];
    if (!q || !q.allowedTimeSeconds) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(q.allowedTimeSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-next if time runs out and not last question
          if (currentIndex < questions.length - 1) handleNext();
          // Optionally, auto-submit if last question
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  // Fetch all data (stage, questions, answers)
  const fetchAll = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Fetch stage
      const stageRes = await fetch(`/api/candidate/assessment/stage?subdomainId=${subdomainId}`);
      if (stageRes.ok) {
        const stageData = await stageRes.json();
        setStage(stageData.stage);
      } else {
        setStage(null);
      }
      // Fetch questions
      const res = await fetch(`/api/candidate/assessment/questions?subdomainId=${subdomainId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load questions');
      }
      const data = await res.json();
      // Fetch saved answers
      const ansRes = await fetch(`/api/candidate/assessment/answers?subdomainId=${subdomainId}`);
      let savedAnswers: Record<string, number> = {};
      if (ansRes.ok) {
        const ansData = await ansRes.json();
        savedAnswers = ansData.answers || {};
      }
      setQuestions(data.questions);
      setAnswers(savedAnswers);
      // Set currentIndex to first unanswered question
      const firstUnansweredIdx = data.questions.findIndex((q: any) => !(q.id in savedAnswers));
      setCurrentIndex(firstUnansweredIdx === -1 ? 0 : firstUnansweredIdx);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Error loading assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomainId]);

  // Handle option select (just update local state)
  const handleOptionSelect = (optionId: number) => {
    const currentQ = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  // Save answer for current question
  const saveCurrentAnswer = async () => {
    const currentQ = questions[currentIndex];
    const selectedOption = answers[currentQ.id];
    const typeId = currentQ.questionTypeId || currentQ.type;
    if (!typeId || typeof selectedOption !== 'number') return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/candidate/assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          subdomainId,
          questionTypeId: typeId,
          selectedOption,
        }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          toast.warning('You have already answered this question.');
        } else {
          setSaveError('Failed to save answer');
          toast.error('Failed to save answer');
        }
      }
    } catch (error) {
      setSaveError('Failed to save answer');
      toast.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async (e?: any) => {
    // Check if triggered by user click
    if (e?.preventDefault) {
      const currentQ = questions[currentIndex];
      if (answers[currentQ.id] === undefined) {
        showConfirmation(
          'No option selected',
          'Please select an option before submitting.',
          () => hide()
        );
        return;
      }
      if (currentIndex === questions.length - 1) {
        await performSubmit();
        return;
      }
    }
    await saveCurrentAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // Move to next without saving
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleExit = () => {
    showConfirmation(
      'Exit Assessment',
      'Are you sure you want to exit? Your progress is saved.',
      () => {
        hide();
        router.push('/candidate/assessment');
      }
    );
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      showConfirmation(
        'Unanswered Questions',
        'You have unanswered questions. Do you still want to submit?',
        () => {
          hide();
          performSubmit();
        }
      );
      return;
    }
    await performSubmit();
  };

  const performSubmit = async () => {
    setSubmitting(true);
    // Save the last answer before submitting
    await saveCurrentAnswer();
    try {
      const res = await fetch('/api/candidate/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomainId }),
      });

      if (!res.ok) throw new Error('Submission failed');

      toast.success('Assessment completed successfully!');
      setStage('completed');
    } catch (error) {
      toast.error('Failed to submit assessment');
      console.error(error);
      setSubmitting(false);
    }
  };

  // Helper to ensure text renders as inline LaTeX
  const renderContent = (text: string) => {
    if (!text) return '';
    const content = text.startsWith('$$') && text.endsWith('$$') 
      ? `$${text.slice(2, -2)}$` 
      : text;
    return <Latex>{content}</Latex>;
  };

  // --- RENDER: Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing assessment environment...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-lg font-semibold mb-4">{loadError}</div>
        <div className="flex gap-4">
          <button
            onClick={fetchAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/candidate/assessment')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: Result ---
  if (stage === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Assessment Completed!</h2>
            <p className="opacity-90">Your answers for {subdomainName} have been recorded.</p>
          </div>
          
          <div className="p-8 text-center">
            <div className="mb-8 text-gray-600">
              <p className="text-lg">Thank you for completing the assessment.</p>
              <p>We are processing your results and will update your profile shortly.</p>
            </div>

            <button
              onClick={() => router.push('/candidate/assessment')}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: Quiz Interface ---
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Format timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 z-50 px-4 md:px-8 flex items-center justify-between shadow-md">
        <div className="flex flex-col justify-center">
          <h1 className="text-white font-medium text-sm md:text-base truncate max-w-md md:max-w-2xl opacity-95">
            {domainName ? `${domainName} | ` : ''}{subdomainName}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {saving && (
            <span className="text-blue-100 text-xs flex items-center animate-pulse">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Saving...
            </span>
          )}
          <button 
            onClick={handleExit} 
            className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 shadow-sm border border-red-400/50"
            aria-label="Exit assessment"
          >
            Exit <span aria-hidden="true" className="ml-0.5">&rarr;</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-28 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-10">
              {/* Question Header */}
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                  {renderContent(currentQuestion.text)}
                </h2>
              </div>

              {/* Options List */}
              <div className="space-y-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`
                        w-full text-left p-4 md:p-5 rounded-lg border-2 transition-all duration-200 flex items-center group relative
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm z-10' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      `}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      {/* Radio Indicator */}
                      <div className={`
                        w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected
                          ? 'border-blue-500 bg-white'
                          : 'border-gray-300 group-hover:border-gray-400 bg-white'
                        }
                      `}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                      
                      {/* Option Text */}
                      <div className={`text-base md:text-lg ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                        {renderContent(option.text)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left: Skip */}
          <button
            onClick={handleSkip}
            disabled={isLastQuestion}
            className="px-6 py-2.5 rounded-full text-gray-500 font-medium hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Skip
          </button>

          {/* Center: Timer */}
          {typeof timeLeft === 'number' && (
            <div 
              className={`font-mono text-lg font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}
              aria-label={`Time remaining: ${formatTime(timeLeft)}`}
            >
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Right: Action */}
          <button
            onClick={handleNext}
            disabled={submitting || saving}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </footer>
    </div>
  );
}
