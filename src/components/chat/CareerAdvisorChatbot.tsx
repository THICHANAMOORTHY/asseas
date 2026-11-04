import React, { useState, useEffect, useRef } from 'react';
import { StudentRecord, PredictionResponse } from '@/api/types';
import {
  ChatMessage,
  askCareerAdvisor,
  getGeminiApiKey,
  setGeminiApiKey,
  isGeminiConfigured,
} from '@/api/geminiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  RotateCcw,
  Key,
  Bot,
  User,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CareerAdvisorChatbotProps {
  student: StudentRecord;
  prediction?: PredictionResponse | null;
  className?: string;
}

export const CareerAdvisorChatbot: React.FC<CareerAdvisorChatbotProps> = ({
  student,
  prediction,
  className,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    const isConfigured = isGeminiConfigured();
    const studentName = student.name || 'Student';
    const dept = student.department || 'Engineering';
    const prob = prediction ? `${Math.round(prediction.probability * 100)}%` : 'under evaluation';

    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      role: 'model',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `👋 **Welcome ${studentName}!**\n\nI am your **CampusHire AI Career Advisor** for **EASA College of Engineering and Technology**.\n\nI have loaded your complete academic profile (**${dept} Engineering**, CGPA **${student.cgpa}**) and your Random Forest placement estimate (**${prob}**).\n\nAsk me anything about campus placement drives, technical interview strategies, project ideas, or preparation roadmaps!`,
    };

    setMessages([welcomeMsg]);
    setTempApiKey(getGeminiApiKey());
  }, [student.student_id, prediction?.probability]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyTurns = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askCareerAdvisor(text, historyTurns, student, prediction);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.modelUsed,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to generate advice: ${err?.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    setGeminiApiKey(tempApiKey);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const handleClearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Chat session refreshed. How can I assist your placement preparation today?`,
    };
    setMessages([welcomeMsg]);
  };

  const QUICK_PROMPTS = [
    `How do I crack ${student.department} technical rounds?`,
    'Give me a 30-day DSA & Aptitude preparation plan',
    'What capstone projects should I build to boost placement odds?',
    'How do I explain my projects using the STAR framework?',
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-[640px] rounded-2xl border border-easa-lavender-soft bg-card shadow-sm overflow-hidden text-sm',
        className
      )}
    >
      {/* EASA College Chatbot Header */}
      <div className="bg-[#29136F] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/easa_logo.png" alt="EASA College Logo" className="h-full w-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#FFC20E] tracking-wide">
                CampusHire AI Advisor
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </div>
            <p className="text-[11px] text-white/80 font-medium truncate max-w-[280px]">
              EASA College Placement & Career Mentoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="text-xs text-white/90 hover:text-[#FFC20E] hover:bg-white/10 h-7 px-2.5 flex items-center gap-1.5"
            title="Configure Gemini API Key"
          >
            <Key className="h-3.5 w-3.5 text-[#FFC20E]" />
            <span className="hidden sm:inline">Gemini Key</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-xs text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 p-0 flex items-center justify-center"
            title="Clear Chat History"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* API Key Modal Banner (Collapsible) */}
      {showKeyModal && (
        <div className="bg-[#1D1745] text-white p-4 border-b border-white/10 text-xs space-y-3 shrink-0 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#FFC20E] flex items-center gap-1.5">
              <Key className="h-4 w-4" /> Google Gemini API Key Configuration
            </span>
            <button
              onClick={() => setShowKeyModal(false)}
              className="text-white/60 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-white/80 text-[11px] leading-relaxed">
            Personalize recommendations using your Gemini API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[#FFC20E] underline inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink className="h-2.5 w-2.5" />
            </a>
            . Your key is stored securely in your browser and local `.env`.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Paste AIzaSy... or AQ... key"
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#FFC20E]"
            />
            <Button
              size="sm"
              onClick={handleSaveKey}
              className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-8 px-4"
            >
              {keySaved ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Saved!
                </span>
              ) : (
                'Save Key'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F6FC]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={cn('flex items-start gap-2.5', isUser ? 'justify-end' : 'justify-start')}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-[#29136F] text-[#FFC20E] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 shadow-xs text-xs leading-relaxed space-y-1.5',
                  isUser
                    ? 'bg-[#29136F] text-white rounded-br-none'
                    : 'bg-white text-[#1D1745] border border-[#E8E5F5] rounded-bl-none'
                )}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content.split('\n\n').map((para, idx) => {
                    // Simple markdown bold parsing
                    const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return (
                      <p
                        key={idx}
                        className="mb-2 last:mb-0 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    );
                  })}
                </div>

                <div
                  className={cn(
                    'text-[10px] flex items-center justify-between gap-2 pt-1 border-t opacity-70',
                    isUser ? 'border-white/20 text-white/80' : 'border-gray-100 text-gray-500'
                  )}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="h-7 w-7 rounded-lg bg-[#FFC20E] text-[#29136F] flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-lg bg-[#29136F] text-[#FFC20E] flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-white border border-[#E8E5F5] rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#29136F]" />
              <span>Analyzing student profile & formulating career strategy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-white border-t border-[#E8E5F5] flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[11px] font-semibold text-[#29136F] flex items-center gap-1 shrink-0">
          <Sparkles className="h-3 w-3 text-[#FFC20E]" /> Suggested:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#F7F6FC] hover:bg-[#E8E5F5] text-[#29136F] border border-[#E8E5F5] font-medium whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-[#E8E5F5] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask EASA Career AI about placement preparation, projects, interview questions...`}
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-xl bg-[#F7F6FC] border border-[#E8E5F5] text-xs text-[#1D1745] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#29136F] disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="bg-[#FFC20E] text-[#29136F] hover:bg-[#E6AD00] font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
};

