import React from 'react';

function PortalSettings() {
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    alert('System settings stored.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Portal Properties Configuration</h2>
        <p className="text-slate-500 text-xs mt-1">Configure global parameters and security thresholds.</p>
      </div>

      <form onSubmit={handleSettingsSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Society Name Label</label>
            <input type="text" defaultValue="Suyash Pride Housing Society Ltd" className="w-full px-3 py-2 border rounded focus:outline-none" required />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Maintenance Charge (Monthly)</label>
            <input type="number" defaultValue="3500" className="w-full px-3 py-2 border rounded focus:outline-none" required />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="font-bold text-society-primary text-sm">Security Parameters</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-society-primary" />
              <span>Require committee admin approval for new resident accounts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded text-society-primary" />
              <span>Enable public visitor chatbot on homepage</span>
            </label>
          </div>
        </div>

        <button type="submit" className="bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold text-xs py-2 px-6 rounded transition">
          Apply Properties
        </button>
      </form>
    </div>
  );
}

export default PortalSettings;
