import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../../services/api';

function ChatbotWidget({ isPublic = false }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Namaste! I am the Suyash Pride AI Assistant. I can help you with rules, bylaws, office hours, and NOC procedures. What can I answer for you today?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQueries = [
    'Next AGM Date',
    'Visitor Parking Rules',
    'NOC Application Guide',
    'Office Timings'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || inputVal;
    if (!queryText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: queryText.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      // Choose endpoint based on prop
      const endpoint = isPublic ? '/chatbot/public-query' : '/chatbot/query';
      const response = await api.post(endpoint, { query: queryText.trim() });
      
      const botReply = response.data.response || "I didn't receive a response from the server.";
      
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply
      }]);
    } catch (err) {
      console.error('Chatbot API error, falling back to local simulation:', err);
      
      // Fallback local response
      let botReply = "I am processing your query. For official guidelines, please consult the society bylaws or contact the committee secretary at support@suyashpride.org.";
      const query = queryText.toLowerCase();

      if (query.includes('office') || query.includes('timing') || query.includes('hours') || query.includes('open')) {
        botReply = "The committee office is open on Saturdays & Sundays from 10:00 AM to 1:00 PM. It is located in the Ground Floor Lobby area.";
      } else if (query.includes('bill') || query.includes('maintenance') || query.includes('due') || query.includes('charge')) {
        botReply = "Monthly maintenance charges are ₹3,500 for residential flats, due by the 15th of each month. Payments can be settled online via Razorpay in the member portal.";
      } else if (query.includes('parking') || query.includes('car') || query.includes('vehicle') || query.includes('slot')) {
        botReply = "Visitor parking is allowed inside designated slots V-01 to V-05 for up to 4 hours. Residents must register guest vehicles at the main gate or pre-approve them in the portal.";
      } else if (query.includes('noc') || query.includes('resale') || query.includes('sell') || query.includes('rent')) {
        botReply = "NOC application templates are available in the Downloads section. Please submit the completed format alongside police verification details at the society office on weekends.";
      } else if (query.includes('agm') || query.includes('meeting') || query.includes('sgm')) {
        botReply = "The next Annual General Meeting (AGM) is scheduled for Sunday, June 28, 2026, at 11:00 AM in the Clubhouse. Official agenda letters have been dispatched.";
      }

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden flex flex-col h-[480px] transition-theme">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-society-primary text-white border-b border-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-emerald-450 rounded-full animate-pulse"></span>
          <span className="font-bold text-xs tracking-wider uppercase">Suyash Assistant</span>
        </div>
        <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>AI Helpdesk</span>
        </span>
      </div>

      {/* Messages Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-society-primary/10 text-society-primary'
              }`}>
                {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-society-primary text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mr-auto"
            >
              <div className="p-2 rounded-full bg-society-primary/10 text-society-primary flex-shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs w-20 flex gap-1 justify-center items-center shadow-sm">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries Suggestion Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-1.5">
        {quickQueries.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="text-[10px] font-semibold text-slate-550 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask e.g. 'when is the AGM?' or 'parking rules'..." 
          className="flex-grow border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-society-secondary focus:border-society-secondary focus:outline-none transition-theme"
          disabled={isTyping}
        />
        <button 
          type="submit"
          disabled={isTyping || !inputVal.trim()}
          className="bg-society-primary hover:bg-[#0b213b] dark:bg-society-secondary dark:text-society-primary disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition active:scale-95 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default ChatbotWidget;
