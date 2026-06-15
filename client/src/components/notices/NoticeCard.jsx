import React from 'react';
import { Link } from 'react-router-dom';

export function NoticeCard({ id, title, content, date, isPinned }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition relative overflow-hidden transition-theme">
      {isPinned && (
        <span className="absolute top-0 right-0 bg-[#D4AF37] text-society-primary font-bold text-[9px] uppercase px-3 py-1 rounded-bl tracking-wider shadow-sm">
          Pinned
        </span>
      )}
      <h4 className="font-bold text-society-primary dark:text-[#D4AF37] text-base mb-1 pr-16">{title}</h4>
      <span className="text-slate-400 dark:text-slate-500 text-xs mb-3 block">{date}</span>
      <p className="text-slate-650 dark:text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">{content}</p>
      <Link to={`/notices/${id}`} className="text-society-primary dark:text-slate-350 hover:text-yellow-600 dark:hover:text-[#D4AF37] font-bold text-xs inline-flex items-center gap-1 transition">
        View Announcement →
      </Link>
    </div>
  );
}

export default NoticeCard;
