const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`
        bg-slate-200 dark:bg-surface-700 
        animate-pulse rounded
        ${className}
      `}
      {...props}
    />
  );
};

export const SkeletonCard = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

export default Skeleton;
