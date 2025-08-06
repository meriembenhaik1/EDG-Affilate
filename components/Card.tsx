import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#00FF7F] transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
};