import React from 'react';

export const LighthouseLogo = ({ className = '', size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lightBeamsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e9f95a" />
          <stop offset="100%" stopColor="#e9f95a" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="500" height="500" fill="#0b4d83" />
      
      {/* Light beams */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path 
          key={i}
          d={`M250,250 L${120 + i * 35},0 L${135 + i * 35},0 Z`} 
          fill="url(#lightBeamsGradient)" 
          opacity="0.7"
        />
      ))}
      
      {/* Light glow */}
      <circle cx="250" cy="85" r="35" fill="#e9f95a" opacity="0.9" />
      
      {/* Lighthouse */}
      <rect x="225" y="100" width="50" height="200" fill="#e9f95a" />
      <rect x="200" y="300" width="100" height="40" fill="#e9f95a" />
      
      {/* Lighthouse windows */}
      <rect x="237" y="140" width="25" height="25" fill="#0b4d83" />
      <rect x="237" y="200" width="25" height="25" fill="#0b4d83" />
      <rect x="237" y="260" width="25" height="25" fill="#0b4d83" />
    </svg>
  );
};

export default LighthouseLogo;