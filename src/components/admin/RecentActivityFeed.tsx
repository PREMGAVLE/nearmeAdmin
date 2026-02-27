import { Clock, CheckCircle, XCircle, Crown, CreditCard, Building2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  type: 'business_submitted' | 'business_approved' | 'business_rejected' | 'premium_request' | 'payment_verified';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info' | 'error';
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'business_submitted':
        return <Building2 className="h-4 w-4" />;
      case 'business_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'business_rejected':
        return <XCircle className="h-4 w-4" />;
      case 'premium_request':
        return <Crown className="h-4 w-4" />;
      case 'payment_verified':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'warning':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full border ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}