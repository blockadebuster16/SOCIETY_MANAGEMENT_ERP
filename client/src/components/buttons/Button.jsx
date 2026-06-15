import React from 'react';

function Button({ children, type = 'button', variant = 'primary', onClick, className = '' }) {
  const baseStyles = 'px-4 py-2 rounded font-semibold text-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  const variants = {
    primary: 'bg-society-primary text-white hover:bg-slate-800 focus:ring-society-primary',
    secondary: 'gold-gradient text-society-primary hover:brightness-110 focus:ring-society-secondary border border-[#B89628]',
    danger: 'bg-society-danger text-white hover:bg-red-750 focus:ring-society-danger',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-slate-500'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
