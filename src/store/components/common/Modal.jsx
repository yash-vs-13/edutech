import React, { memo, useEffect } from 'react';
import Button from './Button';

const Modal = memo(({ isOpen, onClose, title, children, size = 'md' }) => {
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

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-3 sm:p-4 pt-14 sm:pt-10"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${sizes[size]} w-full max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b shrink-0">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;