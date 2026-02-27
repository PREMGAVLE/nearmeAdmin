import { CheckCircle, Crown, CreditCard, Users, Bell, Settings, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsCardProps {
  onApprovePending: () => void;
  onVerifyPayments: () => void;
  onManageCategories: () => void;
  onViewReports: () => void;
  onSendNotifications: () => void;
}

export function QuickActionsCard({
  onApprovePending,
  onVerifyPayments,
  onManageCategories,
  onViewReports,
  onSendNotifications
}: QuickActionsCardProps) {
  const actions = [
    {
      icon: CheckCircle,
      label: 'Approve Pending',
      description: 'Review business approvals',
      color: 'text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200',
      onClick: onApprovePending
    },
    {
      icon: CreditCard,
      label: 'Verify Payments',
      description: 'Check payment status',
      color: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200',
      onClick: onVerifyPayments
    },
    {
      icon: Crown,
      label: 'Premium Requests',
      description: 'Handle premium upgrades',
      color: 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200',
      onClick: () => {} // Add handler
    },
    {
      icon: Users,
      label: 'Manage Users',
      description: 'User management',
      color: 'text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200',
      onClick: () => {} // Add handler
    },
    {
      icon: FileText,
      label: 'View Reports',
      description: 'Analytics & insights',
      color: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200',
      onClick: onViewReports
    },
    {
      icon: Bell,
      label: 'Send Notifications',
      description: 'Broadcast messages',
      color: 'text-pink-600 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200',
      onClick: onSendNotifications
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used admin tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`justify-start h-auto p-3 ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}