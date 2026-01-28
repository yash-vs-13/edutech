import React, { memo } from 'react';

const Loading = memo(({ size = 'md', className = '', fullPage = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  // If fullPage is true, center it on the entire viewport
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div
          className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        />
      </div>
    );
  }
  
  // Otherwise, use the provided className for inline usage
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;