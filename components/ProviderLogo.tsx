import React from 'react';

interface Props {
  provider: 'hulu' | 'disney' | 'netflix' | 'tvn';
  className?: string;
}

export const ProviderLogo: React.FC<Props> = ({ provider, className = '' }) => {
  if (provider === 'hulu') {
    return (
      <span className={`font-bold text-green-500 tracking-wide ${className}`} style={{ fontFamily: 'sans-serif' }}>
        hulu
      </span>
    );
  }
  if (provider === 'disney') {
    return (
      <span className={`font-bold text-white tracking-widest ${className}`} style={{ fontFamily: 'serif' }}>
        Disney+
      </span>
    );
  }
  return <span className={`font-bold text-red-600 ${className}`}>NETFLIX</span>;
};
