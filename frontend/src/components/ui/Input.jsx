import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      type = 'text',
      label,
      error,
      required,
      icon: Icon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full px-4 py-2 rounded-lg
              border transition-colors duration-200
              bg-white dark:bg-surface-800
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent
              ${error ? 'border-red-500' : 'border-slate-300 dark:border-surface-600'}
              ${Icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
