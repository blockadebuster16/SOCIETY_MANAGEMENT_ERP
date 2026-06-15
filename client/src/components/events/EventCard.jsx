import React from 'react';
import { Link } from 'react-router-dom';

export function EventCard({ id, title, description, date, venue, banner }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition transition-theme">
      <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-150 dark:border-slate-700">
        {banner ? (
          <img src={banner} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">No Event Image</span>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h4 className="font-bold text-society-primary dark:text-[#D4AF37] text-base mb-1">{title}</h4>
        <span className="text-[#D4AF37] font-semibold text-xs mb-3">{date} | {venue}</span>
        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">{description}</p>
        <div className="mt-auto pt-2">
          <Link to={`/events/${id}`} className="text-society-primary dark:text-slate-350 hover:text-yellow-600 dark:hover:text-[#D4AF37] font-bold text-xs inline-flex items-center gap-1 transition">
            Read Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
