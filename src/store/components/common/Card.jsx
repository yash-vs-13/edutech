import React, { memo } from 'react';

const Card = memo(({ children, className = '', noBackground = false, ...props }) => {
  const baseClasses = noBackground
    ? 'bg-transparent shadow-none'
    : 'bg-white shadow-md';

  return (
    <div
      className={`${baseClasses} rounded-lg p-4 sm:p-5 lg:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;