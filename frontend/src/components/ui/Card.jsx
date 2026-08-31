import { forwardRef } from 'react';

const Card = forwardRef(
  ({ className = '', children, variant = 'default', ...props }, ref) => {
    const baseStyles =
      'rounded-xl transition-all duration-200 border';

    const variants = {
      default:
        'bg-[var(--panel-bg)] border-[var(--border-color)] shadow-[0_10px_30px_var(--shadow-soft)]',
      elevated:
        'bg-[var(--panel-bg)] border-[var(--border-color)] shadow-[0_18px_45px_var(--shadow-soft)] hover:shadow-[0_20px_50px_var(--shadow-soft)] hover:border-amber-300 dark:hover:border-amber-500/40',
      glass:
        'bg-white/10 dark:bg-surface-800/20 backdrop-blur-md border border-white/20 dark:border-surface-600/30',
      subtle:
        'bg-[var(--panel-strong)] border-[var(--border-color)]',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 border-b border-slate-200 dark:border-surface-700 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 border-t border-slate-200 dark:border-surface-700 flex gap-3 ${className}`} {...props} />
));
CardFooter.displayName = 'CardFooter';

export default Card;
