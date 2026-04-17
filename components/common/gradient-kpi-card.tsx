'use client';

interface GradientKPIProps {
  title: string;
  value: string | number;
  gradient: string;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
}

export function GradientKPICard({ title, value, gradient, icon, trend }: GradientKPIProps) {
  return (
    <div className={`${gradient} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
            trend.direction === 'up' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
          }`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-sm opacity-90 mb-2">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
