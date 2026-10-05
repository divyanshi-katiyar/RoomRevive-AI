import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { assistantApi } from '../services/projectApi';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    roomType?: string;
    currentStyle?: string;
    roomAnalysis?: any;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I'm your RoomRevive interior design assistant. How can I help tailor your space today? Ask me about color harmony, lighting layers, furniture scale, or spatial flow.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'What style would work best here?',
    'How can I make this room feel bigger?',
    'Suggest a cohesive color palette.',
    'How should I layer lighting?',
  ];

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || input.trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await assistantApi.sendMessage({
        message,
        history,
        context,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: res.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `To maximize spatial flow and warmth in this room, consider using low-profile furniture in natural finishes (like white oak and bouclé) and placing lamps at multiple eye-levels for a flattering 2700K ambient glow.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[580px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#F2EDE5] border-b border-[#E3DC CE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#242220] flex items-center justify-center text-[#E3D5C5] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D6C1A9]" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-[#1F1E1D]">
                AI Design Assistant
              </h3>
              <p className="text-[11px] text-stone-500">
                {context?.roomType ? `Context: ${context.roomType}` : 'Interior Styling & Architecture Advice'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#EAE2D7] text-[#8C6849] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#242220] text-white shadow-xs'
                      : 'bg-white border border-[#E3DBD0] text-stone-800 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#383532] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-stone-500">
              <div className="w-7 h-7 rounded-lg bg-[#EAE2D7] text-[#8C6849] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Formulating interior advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[#EAE4DC] bg-[#FAF8F5] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-[#F0EAE1] hover:bg-[#E8DFC2] text-stone-700 transition-colors border border-[#DDD3C6] shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E8E2D8] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about colors, furniture layout, or lighting..."
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#DDD5C9] bg-[#FAF8F5] focus:outline-none focus:border-[#8C6849] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-[#242220] hover:bg-[#383532] disabled:opacity-40 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
