import { useState } from 'react';
import {
  Building2, Users, CreditCard, TrendingUp, ClipboardCheck, Crown, 
  MessageSquare, CalendarCheck, Activity, DollarSign, Target, Phone, 
  BookOpen
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses, useApproveBusiness, useRejectBusiness } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton, TableSkeleton } from '@/components/TableSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName } from '@/lib/helpers';

// Import admin components
import { ChartsSection } from '@/components/admin/ChartsSection';
import { PendingApprovalsTable } from '@/components/admin/PendingApprovalsTable';
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed';
import { QuickActionsCard } from '@/components/admin/QuickActionsCard';

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  
  // API calls - using actual backend services
  const { data: stats, isLoading: statsLoading } = useDashboardStats('super_admin');
  const { data: businessesData, isLoading: businessesLoading } = useBusinesses({ limit: 10 });
  const { data: pendingData, isLoading: pendingLoading } = useBusinesses({ approvalStatus: 'pending', limit: 50 });
  const { data: userData } = useUsers({ limit: 100 });
  const { data: categoryData } = useCategories({ limit: 100 });
  
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();

  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const businesses = businessesData?.data?.items || [];
  const pendingBusinesses = pendingData?.items || [];

  // Calculate category distribution from actual data
  const getCategoryDistribution = () => {
    const distribution: { [key: string]: number } = {};
    categories.forEach(category => {
      const count = businesses.filter(b => b.categoryId === category._id).length;
      if (count > 0) {
        distribution[category.name] = count;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  // Generate recent activities from actual business data
  const getRecentActivities = () => {
    const activities = [];
    
    // Add recent business submissions
    const recentBusinesses = businesses
      .filter(b => b.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    recentBusinesses.forEach((business, index) => {
      const userName = getUserName(users, business.createdBy as string);
      const categoryName = getCategoryName(categories, business.categoryId);
      
      activities.push({
        id: `business-${business._id}`,
        type: business.approvalStatus === 'pending' ? 'business_submitted' :
               business.approvalStatus === 'approved' ? 'business_approved' : 'business_rejected',
        title: business.approvalStatus === 'pending' ? 'New Business Registration' :
               business.approvalStatus === 'approved' ? 'Business Approved' : 'Business Rejected',
        description: `${business.businessName} • ${categoryName}`,
        timestamp: new Date(business.createdAt),
        status: business.approvalStatus === 'approved' ? 'success' :
                business.approvalStatus === 'rejected' ? 'error' : 'info'
      });
    });

    // Add premium requests
    const premiumRequests = businesses.filter(b => b.premiumRequestStatus === 'premium_requested').slice(0, 2);
    premiumRequests.forEach(business => {
      activities.push({
        id: `premium-${business._id}`,
        type: 'premium_request' as const,
        title: 'Premium Upgrade Request',
        description: `${business.businessName} requested premium listing`,
        timestamp: new Date(business.createdAt),
        status: 'warning' as const
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 4);
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Business Approved' })
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({
      id,
      rejectionReason: 'Rejected by super admin'
    }, {
      onSuccess: () => toast({ title: 'Business Rejected' })
    });
  };

  // Navigation handlers
  const handleNavigateToApprovals = () => {
    // Navigate to pending approvals page
    window.location.href = '/super-admin/approvals';
  };

  const handleNavigateToPayments = () => {
    // Navigate to payments page
    window.location.href = '/super-admin/payments';
  };

  const handleNavigateToCategories = () => {
    // Navigate to categories page
    window.location.href = '/super-admin/categories';
  };

  const handleNavigateToReports = () => {
    // Navigate to reports page
    window.location.href = '/super-admin/reports';
  };

  const handleSendNotifications = () => {
    toast({ title: 'Notification System', description: 'Opening notification composer...' });
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Complete overview of nearmeb2b.city platform</p>
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
          <StatsCard
            title="Total Businesses"
            value={stats?.totalBusinesses || 0}
            icon={Building2}
            variant="info"
            trend={stats?.totalBusinessesTrend}
            trendUp={stats?.totalBusinessesTrend?.startsWith('+')}
            subtitle="All registered businesses"
          />
          <StatsCard
            title="Premium Listings"
            value={stats?.premiumListings || 0}
            icon={Crown}
            variant="premium"
            trend={stats?.premiumListingsTrend}
            trendUp={stats?.premiumListingsTrend?.startsWith('+')}
            subtitle="Premium members"
          />
          <StatsCard
            title="Total Salesmen"
            value={stats?.totalSalesmen || 0}
            icon={Users}
            variant="success"
            trend={stats?.totalSalesmenTrend}
            trendUp={stats?.totalSalesmenTrend?.startsWith('+')}
            subtitle="Field agents"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon={ClipboardCheck}
            variant="warning"
            trend={stats?.pendingApprovalsTrend}
            trendUp={stats?.pendingApprovalsTrend?.startsWith('+')}
            subtitle="Need review"
          />
        </div>

        {/* Enhanced KPI Cards - Row 2 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Verified Payments"
            value={stats?.verifiedPayments || 0}
            icon={CreditCard}
            variant="success"
            trend={stats?.verifiedPaymentsTrend}
            trendUp={stats?.verifiedPaymentsTrend?.startsWith('+')}
            subtitle="Confirmed transactions"
          />
          <StatsCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            icon={MessageSquare}
            variant="info"
            trend={stats?.totalLeadsTrend}
            trendUp={stats?.totalLeadsTrend?.startsWith('+')}
            subtitle="This month"
          />
          <StatsCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={CalendarCheck}
            variant="secondary"
            trend={stats?.totalBookingsTrend}
            trendUp={stats?.totalBookingsTrend?.startsWith('+')}
            subtitle="Completed"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
            trend={stats?.totalRevenueTrend}
            trendUp={stats?.totalRevenueTrend?.startsWith('+')}
            subtitle="Platform revenue"
          />
        </div>

        {/* Analytics Charts Section */}
        <ChartsSection
          totalLeads={stats?.totalLeads || 0}
          totalRevenue={stats?.totalRevenue || 0}
          totalBusinesses={stats?.totalBusinesses || 0}
          categoryData={getCategoryDistribution()}
        />

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityFeed activities={getRecentActivities()} />
          </div>
          <div>
            <QuickActionsCard
              onApprovePending={handleNavigateToApprovals}
              onVerifyPayments={handleNavigateToPayments}
              onManageCategories={handleNavigateToCategories}
              onViewReports={handleNavigateToReports}
              onSendNotifications={handleSendNotifications}
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

        {/* Recent Businesses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Businesses</CardTitle>
            <CardDescription>Latest business registrations across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessesLoading ? (
                    <TableSkeleton cols={6} />
                  ) : businesses?.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="font-medium">{b.businessName}</TableCell>
                      <TableCell>{b.address.city}</TableCell>
                      <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                      <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                      <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                      <TableCell className="text-muted-foreground">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {!businessesLoading && (!businesses || businesses.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No businesses found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}