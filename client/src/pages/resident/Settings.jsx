import React from 'react';

function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary">Account Settings</h2>
        <p className="text-slate-500 text-xs mt-1">Configure your login passwords, system alerts, and toggle parameters.</p>
      </div>

      <div className="bg-white border border-slate-205 rounded-lg p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-society-primary text-base mb-2">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-xs text-slate-700">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-society-primary focus:ring-society-primary" />
              <span>Receive notices broadcast alerts via email</span>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-700">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-society-primary focus:ring-society-primary" />
              <span>Notify me when my maintenance bill is ready</span>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-700">
              <input type="checkbox" className="rounded border-slate-300 text-society-primary focus:ring-society-primary" />
              <span>Receive monthly visitor summary logs</span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-bold text-society-primary text-base mb-4">Security Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-society-primary text-white font-semibold text-xs py-2 px-4 rounded hover:bg-slate-800 transition">
              Change Login Password
            </button>
            <button className="border border-slate-300 text-slate-700 font-semibold text-xs py-2 px-4 rounded hover:bg-slate-50 transition">
              Setup Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
