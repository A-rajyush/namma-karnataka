import React, { useState } from 'react';
import { GeneratedItinerary } from '../utils/plannerEngine';
import { CheckCircle2, Compass, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  itinerary?: GeneratedItinerary;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyItinerary: (itinerary: GeneratedItinerary) => void;
}

const QUICK_PROMPTS = [
  'Plan a 5-day trekking trip in the Western Ghats.',
  'Suggest a quiet Coorg and Kabini honeymoon.',
  'Find waterfalls near Chikmagalur and Agumbe.',
  'Create a 3-day Hampi and Badami heritage circuit.',
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyItinerary,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Namaskara. Tell me how many days you have, who you are traveling with, and what you would love to see—coffee estates in Coorg, Hampi temples, coastal trails in Gokarna, or rainforest waterfalls.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Here is your custom Karnataka itinerary.',
        itinerary: data.itinerary,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to reach the trip desk right now. Please try one of the quick suggestions above.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-concierge-drawer-title"
    >
      <div className="w-full max-w-md h-full surface-card border-l border-hairline flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg badge-accent flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 id="ai-concierge-drawer-title" className="text-base font-bold text-ink">
                Trip Planning Assistant
              </h2>
              <p className="text-xs text-caption">
                Ask for custom routes, detours, or seasonal advice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trip Assistant"
            className="p-1.5 rounded-lg text-caption hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-3 border-b border-hairline surface-subtle">
          <div className="text-[11px] font-medium text-caption mb-2">Suggested requests:</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendPrompt(q)}
                className="px-2.5 py-1 text-xs surface-card hover:opacity-85 text-body rounded-lg transition-opacity text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'btn-primary font-medium'
                    : 'surface-subtle text-ink'
                }`}
              >
                <p>{msg.text}</p>

                {msg.itinerary && (
                  <div className="mt-3 pt-3 border-t border-hairline space-y-2">
                    <div className="text-xs font-bold text-ink">{msg.itinerary.title}</div>
                    <div className="text-xs text-body font-mono-tabular">
                      {msg.itinerary.numDays} Days · {msg.itinerary.routeMetrics.totalDistanceKm} km
                      · Est. INR {msg.itinerary.budgetBreakdown.totalTripCost.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyItinerary(msg.itinerary!);
                        onClose();
                      }}
                      className="w-full mt-1.5 px-3 py-2 text-xs font-semibold rounded-xl btn-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Load This Route into Planner</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-xs text-caption animate-pulse">
              Preparing your custom Karnataka route...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendPrompt(input);
          }}
          className="p-4 border-t border-hairline surface-subtle flex items-center gap-2"
        >
          <label htmlFor="concierge-chat-input" className="sr-only">
            Ask Trip Assistant
          </label>
          <input
            id="concierge-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your ideal trip..."
            className="flex-1 surface-card rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-caption focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Send message"
            className="px-4 py-2.5 rounded-xl btn-primary font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
