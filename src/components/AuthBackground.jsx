import React from 'react';

const AuthBackground = ({ children }) => {
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top left, #0284C7 0%, rgba(2, 132, 199, 0.7) 30%, rgba(2, 132, 199, 0.3) 50%, transparent 70%),
          radial-gradient(ellipse at bottom right, #0284C7 0%, rgba(2, 132, 199, 0.7) 30%, rgba(2, 132, 199, 0.3) 50%, transparent 70%),
          linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.3) 100%),
          #FFFFFF
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        position: 'relative'
      }}
    >
      {/* Professional Pattern Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(2, 132, 199, 0.03) 10px,
              rgba(2, 132, 199, 0.03) 20px
            )
          `,
          opacity: 0.5
        }}
      />
      
      {/* Decorative Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Circle - Top Right */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#0284C7', opacity: 0.15 }}
        />
        {/* Large Circle - Bottom Left */}
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#0284C7', opacity: 0.15 }}
        />
        {/* Medium Circle - Center Right */}
        <div 
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-2xl"
          style={{ backgroundColor: '#0284C7', opacity: 0.1, transform: 'translate(50%, -50%)' }}
        />
        {/* Small Circle - Center Left */}
        <div 
          className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full blur-xl"
          style={{ backgroundColor: '#0284C7', opacity: 0.12 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthBackground;
