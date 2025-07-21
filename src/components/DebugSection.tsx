import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface DebugSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

export const DebugSection: React.FC<DebugSectionProps> = ({
  title,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  children
}) => {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-white p-2 rounded-full">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};