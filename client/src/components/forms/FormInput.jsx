import React from 'react';

function FormInput({ label, id, type = 'text', register, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        {...(register ? register(id) : {})}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition text-sm ${
          error 
            ? 'border-society-danger focus:ring-society-danger focus:border-society-danger' 
            : 'border-slate-300 focus:ring-society-primary focus:border-society-primary'
        }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-society-danger mt-1 block">
          {error.message}
        </span>
      )}
    </div>
  );
}

export default FormInput;
