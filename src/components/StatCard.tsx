import { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  color: 'blue' | 'green' | 'red' | 'orange';
};

const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} p-6 rounded-lg shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`${colors.text} text-2xl font-bold mt-1`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isUpward ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isUpward ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">do mês passado</span>
            </div>
          )}
        </div>
        <div className={`${colors.iconBg} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;