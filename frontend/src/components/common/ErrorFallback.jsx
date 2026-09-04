import { useState } from 'react';
import Button from '../ui/Button';

const ErrorFallback = ({ error, resetError }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-surface-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We encountered an unexpected error. Please try again.
          </p>
          {showDetails && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800 dark:text-red-200 font-mono break-all">
                {error?.message || 'Unknown error'}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={resetError} fullWidth>
              Try Again
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              fullWidth
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
            If the problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
