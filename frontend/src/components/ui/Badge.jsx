import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

const Badge = ({ variant, className = '', children, ...props }) => {
  return (
    <span className={badgeVariants({ variant, className })} {...props}>
      {children}
    </span>
  );
};

export default Badge;
