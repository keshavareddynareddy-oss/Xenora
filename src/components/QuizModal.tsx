import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, RefreshCw, Award, HelpCircle, Loader2 } from 'lucide-react';
import { DEFAULT_QUIZZES } from '../anatomy/quizzes';
import { QuizQuestion } from '../types/learning';
import { fetchAiQuiz } from '../services/geminiService';
import { TopicId, DisciplineId } from '../types/discipline';
import { TOPICS_MAP } from '../data/curriculumData';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStructure: (structureId: string) => void;
  activeTopic?: TopicId;
  activeDiscipline?: DisciplineId;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSelectStructure,
  activeTopic = 'four_stroke_engine',
  activeDiscipline = 'mechanical',
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZZES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const topicDef = TOPICS_MAP.get(activeTopic);

  // Filter or initialize questions based on active discipline/topic
  useEffect(() => {
    if (isOpen) {
      const filtered = DEFAULT_QUIZZES.filter(
        (q) => q.category === activeDiscipline || q.category === activeTopic
      );
      if (filtered.length > 0) {
        setQuestions(filtered);
      } else {
        setQuestions(DEFAULT_QUIZZES);
      }
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
    }
  }, [isOpen, activeTopic, activeDiscipline]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Automatically highlight the target structure in the 3D model
    if (currentQ.targetStructureId) {
      onSelectStructure(currentQ.targetStructureId);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
  };

  const handleGenerateAiQuiz = async () => {
    setIsGeneratingAi(true);
    try {
      const newQuestions = await fetchAiQuiz(
        activeDiscipline,
        'Intermediate',
        activeDiscipline,
        topicDef?.name || activeTopic
      );
      if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
      }
    } catch (e) {
      console.error('Failed to generate AI quiz:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-sm text-slate-100">
                  {topicDef?.name || 'Engineering & Science'} Knowledge Quiz
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                  Score: {score}/{questions.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              Multiple Choice Challenge
            </div>
            <h4 className="font-display text-base font-semibold text-slate-100 leading-snug">
              {currentQ.question}
            </h4>
          </div>

          {/* Answer Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctAnswer;

              let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'border-rose-500/80 bg-rose-950/30 text-rose-200';
                } else {
                  btnStyle = 'border-slate-800/40 opacity-40 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs leading-normal flex items-start gap-3 transition-colors ${btnStyle}`}
                >
                  <span className="font-mono text-[11px] font-semibold text-slate-400 mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="flex-1">{opt}</span>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Technical & Scientific Explanation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleGenerateAiQuiz}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-colors"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Generate New AI Questions</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex === questions.length - 1 && isAnswered ? (
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart Quiz</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white text-xs font-semibold transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
