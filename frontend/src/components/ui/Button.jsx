import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 active:scale-[0.98] shadow-sm',
  {
    variants: {
      variant: {
        primary:
          'bg-amber-500 text-slate-950 hover:bg-amber-400 focus:ring-amber-500 shadow-amber-500/20 uppercase tracking-[0.06em] ![color:rgb(15,23,42)]',
        secondary:
          'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost:
          'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300',
        outline:
          'border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-800 focus:ring-slate-300 shadow-sm',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);


const Button = forwardRef(
  (
    {
      className = '',
      variant,
      size,
      fullWidth,
      isLoading,
      disabled,
      children,
      to,
      href,
      onClick,
      ...props
    },
    ref
  ) => {
    const classes = buttonVariants({ variant, size, fullWidth, className });
    const isDisabled = isLoading || disabled;

    const content = (
      <>
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </>
    );

    if (to && !isDisabled) {
      return (
        <Link ref={ref} to={to} className={classes} onClick={onClick} {...props}>
          {content}
        </Link>
      );
    }

    if (href && !isDisabled) {
      return (
        <a
          ref={ref}
          href={href}
          className={classes}
          onClick={onClick}
          target={props.target || '_self'}
          rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={classes}
        disabled={isDisabled}
        onClick={onClick}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
