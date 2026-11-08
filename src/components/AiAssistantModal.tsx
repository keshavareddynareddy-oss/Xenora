import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { EducationalComponent, TopicId, DisciplineId } from '../types/discipline';
import { fetchChatResponse, fetchStructureExplanation, ChatMessage } from '../services/geminiService';
import { TOPICS_MAP } from '../data/curriculumData';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStructure: EducationalComponent | null;
  activeTopic?: TopicId;
  activeDiscipline?: DisciplineId;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedStructure,
  activeTopic = 'four_stroke_engine',
  activeDiscipline = 'mechanical',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const topicDef = TOPICS_MAP.get(activeTopic);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initial greeting when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (selectedStructure) {
        setMessages([
          {
            id: 'init_1',
            role: 'assistant',
            text: `Welcome to **GestureLab 3D AI Assistant**! You are inspecting **${selectedStructure.name}** in the **${topicDef?.name || '3D Virtual Lab'}**.\n\nAsk me anything regarding its operating principles, physical laws, engineering equations, or practical applications.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages([
          {
            id: 'init_0',
            role: 'assistant',
            text: `Welcome to **GestureLab 3D AI Assistant**! You are exploring **${topicDef?.name || 'Engineering & Science Labs'}**.\n\nI can explain working principles, calculate operating parameters, or analyze individual components in your 3D viewport. What would you like to explore?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen, selectedStructure, topicDef]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputValue.trim();
    if (!prompt || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await fetchChatResponse(
        prompt,
        selectedStructure,
        topicDef?.name,
        activeDiscipline,
        [...messages, userMsg]
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err?.message || 'Failed to receive response from Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepDive = async () => {
    if (!selectedStructure || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const explanation = await fetchStructureExplanation(selectedStructure);
      const aiMsg: ChatMessage = {
        id: `ai_deep_${Date.now()}`,
        role: 'assistant',
        text: explanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err?.message || 'Deep dive generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[82vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                <span>GestureLab AI Tutor</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedStructure
                  ? `Active component: ${selectedStructure.name}`
                  : `Context: ${topicDef?.name || 'Laboratory Overview'}`}
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

        {/* Chat History View */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[9px] font-mono text-right ${
                    m.role === 'user' ? 'text-cyan-200' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Analyzing scientific parameters...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {selectedStructure ? (
            <>
              <button
                onClick={handleDeepDive}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Deep Technical Breakdown</span>
              </button>
              <button
                onClick={() =>
                  handleSendMessage(`Explain the primary working mechanism of ${selectedStructure.name}.`)
                }
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                How does it work?
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `What are the most common mechanical, electrical, or structural failure modes of ${selectedStructure.name}?`
                  )
                }
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                Failure Modes & Diagnostics
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  handleSendMessage(`Explain the complete working cycle of ${topicDef?.name || 'this topic'}.`)
                }
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] whitespace-nowrap transition-colors"
              >
                Explain Working Principle
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `What are the governing physical formulas and thermodynamic/electromagnetic equations for ${topicDef?.name}?`
                  )
                }
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                Governing Equations
              </button>
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask AI about ${selectedStructure?.name || topicDef?.name || 'this system'}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
