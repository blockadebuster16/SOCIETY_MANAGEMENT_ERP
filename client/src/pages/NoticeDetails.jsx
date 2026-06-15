import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function NoticeDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link to="/notices" className="text-society-primary dark:text-[#D4AF37] hover:text-yellow-600 dark:hover:text-yellow-500 font-bold text-xs inline-flex items-center gap-1.5 mb-2 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Circular List</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">Official Announcement</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Viewing announcement ID: {id}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6 transition-theme">
        <div>
          <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-xl mb-4">Water Supply Maintenance Shutdown Details</h3>
          <p className="text-slate-650 dark:text-slate-400 text-xs leading-relaxed">
            The society has contracted cleaning agencies to carry out chemical disinfection of the overhead and underground water reservoirs. Please note that high-pressure pumps will be running throughout the day. Please save water and keep the secondary valves shut. For any emergency requirements, water cans can be requested by contacting the security gate team.
          </p>
        </div>
        <div className="bg-[#D4AF37]/10 p-4 border border-[#D4AF37]/35 dark:border-[#D4AF37]/20 rounded-lg text-xs text-society-primary dark:text-[#D4AF37] font-semibold">
          Note: This notice was dispatched by the Secretary, Suyash Pride Housing Society Ltd Committee.
        </div>
      </div>
    </div>
  );
}

export default NoticeDetails;
