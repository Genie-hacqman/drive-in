import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                w-full ${sizes[size]}
                bg-white dark:bg-surface-800
                rounded-xl shadow-xl border border-slate-200 dark:border-surface-700
                ${className}
              `}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-surface-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              )}

              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
