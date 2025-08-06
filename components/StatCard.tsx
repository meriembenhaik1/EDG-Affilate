import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle,
  color = 'text-[#00FF7F]' 
}) => {
  return (
    <Card>
      <div className="text-center">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};