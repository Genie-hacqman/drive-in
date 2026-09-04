import Button from '../ui/Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel = 'Take Action',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="mb-4 text-slate-400 dark:text-slate-300">
          <Icon size={64} />
        </div>
      )}
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
