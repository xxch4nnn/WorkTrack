import React from 'react';

export const LuminusLogo = ({ className = '', size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="triangleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D066E8" />
          <stop offset="100%" stopColor="#36D3DC" />
        </linearGradient>
        <linearGradient id="triangleGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#36D3DC" />
          <stop offset="100%" stopColor="#5D86FF" />
        </linearGradient>
        <linearGradient id="triangleGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5D86FF" />
          <stop offset="100%" stopColor="#E9EB24" />
        </linearGradient>
      </defs>
      <path 
        d="M100,20 L180,150 L100,150 Z" 
        fill="url(#triangleGradient1)" 
      />
      <path 
        d="M100,150 L180,150 L100,180 Z" 
        fill="url(#triangleGradient2)" 
      />
      <path 
        d="M100,180 L20,150 L100,20 Z" 
        fill="url(#triangleGradient3)" 
      />
    </svg>
  );
};

export default LuminusLogo;