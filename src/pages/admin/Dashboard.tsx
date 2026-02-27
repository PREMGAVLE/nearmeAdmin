import { useState } from 'react';
import {
  Building2, Users, ClipboardCheck, DollarSign, Target, Phone, 
  BookOpen, Crown, Calendar, TrendingUp, Activity
} from 'lucide-react';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses, useApproveBusiness, useRejectBusiness } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName } from '@/lib/helpers';

// Import new components
import { EnhancedStatsCard } from '@/components/admin/EnhancedStatsCard';
import { ChartsSection } from '@/components/admin/ChartsSection';
import { PendingApprovalsTable } from '@/components/admin/PendingApprovalsTable';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { QuickActionsCard } from '@/components/admin/QuickActionsCard';

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // API calls
  const { data: stats, isLoading: statsLoading } = useDashboardStats('admin');
  const { data: pendingData, isLoading: pendingLoading } = useBusinesses({ approvalStatus: 'pending', limit: 50 });
  const { data: userData } = useUsers({ limit: 100 });
  const { data: categoryData } = useCategories({ limit: 100 });
  
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();

  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const pendingBusinesses = pendingData?.items || [];

  // Mock data for demonstration
  const mockSparklineData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 75, 80, 90];
  const mockCategoryData = [
    { name: 'Restaurants', value: 45 },
    { name: 'Retail', value: 32 },
    { name: 'Services', value: 28 },
    { name: 'Healthcare', value: 19 }
  ];

  const mockActivities = [
    {
      id: '1',
      type: 'business_submitted' as const,
      title: 'New Business Registration',
      description: 'Raj Restaurant submitted for approval',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'info' as const
    },
    {
      id: '2',
      type: 'business_approved' as const,
      title: 'Business Approved',
      description: 'City Mall has been approved',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success' as const
    },
    {
      id: '3',
      type: 'premium_request' as const,
      title: 'Premium Upgrade Request',
      description: 'Spa Center requested premium listing',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'warning' as const
    },
    {
      id: '4',
      type: 'payment_verified' as const,
      title: 'Payment Verified',
      description: 'Payment for Tech Store verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'success' as const
    }
  ];

  // Stats from API with fallbacks
  const dashboardStats = {
    totalBusinesses: stats?.totalBusinesses || 156,
    pendingApprovals: stats?.pendingApprovals || 12,
    activeBusinesses: stats?.activeBusinessesTrend || 134,
    premiumBusinesses: stats?.premiumListings || 28,
    totalLeads: stats?.totalLeads || 89,
    totalBookings: stats?.totalBookings || 45,
    totalRevenue: stats?.totalRevenue || 245000,
    conversionRate: stats?.conversionRate || 3.2
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Business Approved' })
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({
      id,
      rejectionReason: 'Rejected by admin'
    }, {
      onSuccess: () => toast({ title: 'Business Rejected' })
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your B2B city marketplace operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Enhanced KPI Cards - Row 1 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Businesses"
            value={dashboardStats.totalBusinesses}
            icon={Building2}
            variant="info"
            trend="+12%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Registered businesses"
          />
          <EnhancedStatsCard
            title="Pending Approvals"
            value={dashboardStats.pendingApprovals}
            icon={ClipboardCheck}
            variant="warning"
            trend="-8%"
            trendUp={false}
            sparklineData={mockSparklineData.slice().reverse()}
            subtitle="Need review"
          />
          <EnhancedStatsCard
            title="Active Businesses"
            value={dashboardStats.activeBusinesses}
            icon={Activity}
            variant="success"
            trend="+5%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Live listings"
          />
          <EnhancedStatsCard
            title="Premium Businesses"
            value={dashboardStats.premiumBusinesses}
            icon={Crown}
            variant="premium"
            trend="+18%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Premium members"
          />
        </div>

        {/* Enhanced KPI Cards - Row 2 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatsCard
            title="Total Leads"
            value={dashboardStats.totalLeads}
            icon={Phone}
            variant="info"
            trend="+15%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="This month"
          />
          <EnhancedStatsCard
            title="Total Bookings"
            value={dashboardStats.totalBookings}
            icon={BookOpen}
            variant="secondary"
            trend="+6%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Completed"
          />
          <EnhancedStatsCard
            title="Total Revenue"
            value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
            trend="+24%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Lifetime"
          />
          <EnhancedStatsCard
            title="Conversion Rate"
            value={`${dashboardStats.conversionRate}%`}
            icon={Target}
            variant="success"
            trend="+2%"
            trendUp={true}
            sparklineData={mockSparklineData}
            subtitle="Lead to booking"
          />
        </div>

        {/* Analytics Charts Section */}
        <ChartsSection
          totalLeads={dashboardStats.totalLeads}
          totalRevenue={dashboardStats.totalRevenue}
          totalBusinesses={dashboardStats.totalBusinesses}
          categoryData={mockCategoryData}
        />

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityFeed activities={mockActivities} />
          </div>
          <div>
            <QuickActionsCard
              onApprovePending={() => toast({ title: 'Navigating to pending approvals' })}
              onVerifyPayments={() => toast({ title: 'Navigating to payment verification' })}
              onManageCategories={() => toast({ title: 'Navigating to categories' })}
              onViewReports={() => toast({ title: 'Navigating to reports' })}
              onSendNotifications={() => toast({ title: 'Opening notification composer' })}
            />
          </div>
        </div>

        {/* Enhanced Pending Approvals Table */}
        <PendingApprovalsTable
          businesses={pendingBusinesses}
          users={users}
          categories={categories}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={pendingLoading}
        />
      </div>
    </div>
  );
}