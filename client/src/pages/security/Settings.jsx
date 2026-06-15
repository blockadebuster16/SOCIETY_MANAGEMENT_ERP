import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, User, Clock, CheckCircle2 } from 'lucide-react';

function SecuritySettings() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [gate, setGate] = useState('Main Gate 1');
  const [shift, setShift] = useState('Day Shift (08:00 AM - 08:00 PM)');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Gate security settings updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-society-primary dark:text-white">Gate & Session Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Configure active gate assignments, check guard profile details, and verify active shift timings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-theme md:col-span-1">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-4 bg-society-primary/10 text-society-primary dark:text-[#D4AF37] rounded-full">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white">
                {user ? `${user.first_name} ${user.last_name}` : 'Bahadur Singh'}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                Main Gate Guard
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-450">Phone:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.phone || '+91 95556 67788'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450">Email:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email || 'security@suyashpride.in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450">Role:</span>
              <span className="font-bold text-[#D4AF37] uppercase text-[9px] tracking-wider bg-slate-900 px-2 py-0.5 rounded">Security</span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme md:col-span-2">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Clock className="w-4.5 h-4.5 text-[#D4AF37]" />
              <span>Shift Configuration</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Active Gate Assignment</label>
                <select
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                >
                  <option value="Main Gate 1">Main Gate 1 (Residential Tower)</option>
                  <option value="Main Gate 2">Main Gate 2 (Commercial Shops Entrance)</option>
                  <option value="Basement Parking Gate">Basement Parking Gate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Active Shift Period</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                >
                  <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift (08:00 AM - 08:00 PM)</option>
                  <option value="Night Shift (08:00 PM - 08:00 AM)">Night Shift (08:00 PM - 08:00 AM)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-society-primary hover:bg-[#0b213b] dark:bg-society-secondary dark:text-society-primary text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-1.5 transition mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;
