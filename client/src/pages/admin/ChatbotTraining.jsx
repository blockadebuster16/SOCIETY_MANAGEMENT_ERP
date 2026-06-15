import React from 'react';

function ChatbotTraining() {
  const faqs = [
    { q: 'What are the office timings?', a: 'Saturdays & Sundays from 10:00 AM to 1:00 PM.' },
    { q: 'How to pay maintenance bills?', a: 'Log in to the portal, go to Bills, and click Pay with Razorpay.' }
  ];

  const handleFAQSubmit = (e) => {
    e.preventDefault();
    alert('FAQ knowledge uploaded to training queue.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">AI Chatbot Training Control</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Train the resident portal assistant with updated guidelines and FAQs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dataset Form */}
        <form onSubmit={handleFAQSubmit} className="bg-white border border-slate-205 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-society-primary text-sm border-b border-slate-100 pb-2">Feed Knowledge (Q&A pair)</h3>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Frequently Asked Question (FAQ)</label>
            <input type="text" placeholder="e.g. When is the water shutoff scheduled?" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 mb-1">Standard Correct Answer</label>
            <textarea rows="3" placeholder="Provide accurate response details..." className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none" required></textarea>
          </div>
          <button type="submit" className="bg-society-primary hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded transition">
            Train Assistant
          </button>
        </form>

        {/* Existing FAQ items */}
        <div className="bg-white border border-slate-205 rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-society-primary text-sm border-b border-slate-100 pb-2">Active FAQ Context</h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="text-xs bg-slate-50 p-3 rounded border border-slate-150 space-y-1">
                <span className="font-bold text-society-primary block">Q: {faq.q}</span>
                <span className="text-slate-600 block">A: {faq.a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotTraining;
