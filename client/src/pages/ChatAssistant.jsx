import React from 'react';
import { motion } from 'framer-motion';
import { Bot, HelpCircle, FileText, Landmark, Key } from 'lucide-react';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';

function ChatAssistant() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const guides = [
    { title: 'Bylaws & Rules', icon: <FileText className="w-5 h-5 text-[#D4AF37]" />, desc: 'Bylaw rules related to pets, visitor parking hours, noise, and waste segregation.' },
    { title: 'Office Timings', icon: <Landmark className="w-5 h-5 text-[#D4AF37]" />, desc: 'Timings for physical document submission and face-to-face committee hearings.' },
    { title: 'Member Access', icon: <Key className="w-5 h-5 text-[#D4AF37]" />, desc: 'Guidance on updating flat profiles, linking vehicles, and paying maintenance bills.' }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto py-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-2">
        <div className="p-3 bg-[#D4AF37]/10 dark:bg-yellow-500/5 rounded-full w-fit mx-auto text-[#D4AF37]">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif mt-3">
          AI Chat Assistant
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Get instant guidance on bylaws, office operational hours, NOC requirements, and parking parameters.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Helper Instructions Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-theme">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <HelpCircle className="w-5 h-5 text-society-secondary" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
                Helpdesk Guidelines
              </h3>
            </div>
            <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed">
              This automated assistant provides public information regarding society governance. It does not parse individual dues history or secret keys unless authenticated.
            </p>
            <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Type keywords or click one of the suggestion chips at the bottom of the chat to interact instantly.
            </p>
          </div>

          <div className="space-y-4">
            {guides.map((g, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex gap-3 transition-theme"
              >
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0">
                  {g.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs">{g.title}</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chatbot Column */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <ChatbotWidget isPublic={true} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ChatAssistant;
