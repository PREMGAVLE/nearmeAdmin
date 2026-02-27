import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'premium' | 'secondary';
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, variant, trend, trendUp }: StatsCardProps) {
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
    <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${variantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}