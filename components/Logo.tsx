import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gradient-to-br from-[#00FF7F] to-emerald-400 rounded-full flex items-center justify-center">
        <span className="text-black font-bold text-lg">E</span>
      </div>
      <div className="hidden md:block">
        <h1 className="text-[#00FF7F] font-bold text-xl">EDG SOFTWARE</h1>
        <p className="text-gray-300 text-sm">SOLUTIONS</p>
      </div>
    </div>
  );
};