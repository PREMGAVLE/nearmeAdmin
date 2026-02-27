import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'premium' | 'secondary';
  trend?: string;
  trendUp?: boolean;
  sparklineData?: number[];
  subtitle?: string;
}

export function EnhancedStatsCard({ 
  title, value, icon: Icon, variant, trend, trendUp, sparklineData, subtitle 
}: EnhancedStatsCardProps) {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-600 border-blue-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-orange-50 text-orange-600 border-orange-200',
    destructive: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-sky-50 text-sky-600 border-sky-200',
    premium: 'bg-purple-50 text-purple-600 border-purple-200',
    secondary: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${variantStyles[variant]} group-hover:scale-105 transition-transform`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg ${
            trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </div>
      
      {/* Mini Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 flex items-end gap-1 mt-3">
          {sparklineData.map((value, index) => (
            <div
              key={index}
              className={`flex-1 rounded-sm ${
                trendUp ? 'bg-green-200' : 'bg-red-200'
              }`}
              style={{ height: `${(value / Math.max(...sparklineData)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}