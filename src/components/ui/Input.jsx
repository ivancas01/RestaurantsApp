import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, icon: Icon, className = '', type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {label}
        </label>
      )}
      <div className="relative w-full group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim/40 group-focus-within:text-primary transition-colors duration-300">
            <Icon size={16} />
          </div>
        )}
        <input 
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`input-field ${Icon ? 'pl-12' : 'px-4'} ${isPassword ? 'pr-12' : ''}`} 
          {...props} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim/40 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
