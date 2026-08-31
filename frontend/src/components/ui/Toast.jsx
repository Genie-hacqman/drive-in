import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    info: <FiInfo className="text-accent-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800',
  };

  const textColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-accent-800 dark:text-accent-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 400 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        ${bgColors[type]} ${textColors[type]}
        shadow-lg backdrop-blur-sm
      `}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
      >
        <FiX size={18} />
      </button>
    </motion.div>
  );
};

export default Toast;
