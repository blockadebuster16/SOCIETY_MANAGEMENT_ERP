import React, { useState } from 'react';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { MessageSquare, Plus, History, Bot, ArrowRight, Sparkles } from 'lucide-react';

function Chatbot() {
  const [sessions, setSessions] = useState([
    { id: 'session-1', title: 'Maintenance Balance Check', date: 'Today, 10:15 AM' },
    { id: 'session-2', title: 'Visitor Parking Slot Rules', date: 'Yesterday' },
    { id: 'session-3', title: 'AGM 2026 Scheduled timings', date: '10 Jun 2026' }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session-1');

  const handleCreateSession = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: `New Inquiry Session`,
      date: 'Just now'
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-society-primary dark:text-white">AI Society Helpdesk Assistant</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Query maintenance invoices, retrieve society by-laws, search upcoming events, or double check visitor parking regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Pane - History Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme lg:col-span-1 flex flex-col h-[520px]">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold text-xs py-2.5 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Recent Conversations</span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-2 pr-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition flex flex-col gap-1 ${
                  activeSessionId === session.id
                    ? 'bg-society-primary/5 border-society-secondary text-society-primary dark:text-[#D4AF37]'
                    : 'bg-slate-50/50 dark:bg-slate-905 border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold truncate w-full flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{session.title}</span>
                </div>
                <span className="text-[9px] text-slate-400 ml-5">{session.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane - Active Widget Chat */}
        <div className="lg:col-span-3 flex flex-col justify-between h-[520px]">
          {/* Inject isPublic = false for members context */}
          <ChatbotWidget isPublic={false} key={activeSessionId} />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
