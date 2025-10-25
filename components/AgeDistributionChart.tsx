
import React from 'react';
import type { AgeDistribution } from '../types';

interface AgeDistributionChartProps {
  data: AgeDistribution;
}

const Bar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
  <div className="flex items-center space-x-4">
    <span className="w-24 text-sm text-gray-400 font-medium">{label}</span>
    <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
      <div
        className="bg-teal-500 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="w-16 text-right text-sm font-semibold text-white">{percentage.toFixed(1)}%</span>
  </div>
);

const AgeDistributionChart: React.FC<AgeDistributionChartProps> = ({ data }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <Bar label="< 20" percentage={data.under20} />
      <Bar label="20 to 40" percentage={data.between20and40} />
      <Bar label="40 to 60" percentage={data.between40and60} />
      <Bar label="> 60" percentage={data.over60} />
    </div>
  );
};

export default AgeDistributionChart;
