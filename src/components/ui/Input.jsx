import React from 'react';

const Input = ({ label, icon: Icon, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-sm font-bold uppercase tracking-widest text-primary">
          {label}
        </label>
      )}
      <div className="relative w-full group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 group-focus-within:text-primary transition-colors duration-300">
            <Icon size={18} />
          </div>
        )}
        <input 
          className={`input-field ${Icon ? 'pl-12' : 'px-4'}`} 
          {...props} 
        />
      </div>
    </div>
  );
};

export default Input;
