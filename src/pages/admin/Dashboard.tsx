import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Building2, Users, ClipboardCheck,
  DollarSign, Target, Phone, BookOpen, Crown, Calendar,
  Search, Download, Bell, Settings, Activity, CreditCard,
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses, useApproveBusiness, useRejectBusiness } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton, TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName } from '@/lib/helpers';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: stats, isLoading: statsLoading } = useDashboardStats('admin');
  const { data: pendingData, isLoading: pendingLoading } = useBusinesses({ approvalStatus: 'pending', limit: 50 });
  const { data: userData } = useUsers({ limit: 1000 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const { toast } = useToast();
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();

  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const pendingBusinesses = pendingData?.items || [];

  // Use stats from API
  const totalBusinesses = stats?.totalBusinesses || 0;
  const activeBusinesses = stats?.activeBusinessesTrend || 0;
  const premiumBusinesses = stats?.premiumListings || 0;
  const pendingApprovals = stats?.pendingApprovals || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalLeads = stats?.totalLeads || 0;
  const totalBookings = stats?.totalBookings || 0;
  const conversionRate = stats?.conversionRate || 0;

  // Filter pending businesses
  const filteredBusinesses = pendingBusinesses.filter(business => {
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBulkApprove = () => {
    const approvedCount = filteredBusinesses.length;
    toast({
      title: 'Bulk Approval',
      description: `Processing ${approvedCount} business approvals...`
    });
  };

  const handleBulkReject = () => {
    const rejectedCount = filteredBusinesses.length;
    toast({
      title: 'Bulk Rejection',
      description: `Processing ${rejectedCount} business rejections...`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your B2B city marketplace</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards - Row 1 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Businesses"
            value={totalBusinesses}
            icon={Building2}
            variant="info"
            trend={stats?.totalBusinessesTrend}
            trendUp={stats?.totalBusinessesTrend?.startsWith('+')}
          />
          <StatsCard
            title="Active Businesses"
            value={activeBusinesses}
            icon={Activity}
            variant="success"
            trend="+8%"
            trendUp={true}
          />
          <StatsCard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={ClipboardCheck}
            variant="warning"
            trend="-3%"
            trendUp={false}
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
            trend="+24%"
            trendUp={true}
          />
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={totalLeads}
            icon={Phone}
            variant="info"
            trend="+15%"
            trendUp={true}
          />
          <StatsCard
            title="Total Bookings"
            value={totalBookings}
            icon={BookOpen}
            variant="secondary"
            trend="+6%"
            trendUp={true}
          />
          <StatsCard
            title="Premium Businesses"
            value={premiumBusinesses}
            icon={Crown}
            variant="premium"
            trend="+18%"
            trendUp={true}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={Target}
            variant="success"
            trend="+2%"
            trendUp={true}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Leads Analytics</CardTitle>
              <CardDescription>Real-time lead generation data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Phone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">{totalLeads} Total Leads</p>
                  <p className="text-sm">Chart integration available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Monthly revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">₹{totalRevenue.toLocaleString()} Total Revenue</p>
                  <p className="text-sm">Chart integration available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest business registration requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBusinesses.slice(0, 5).map((business) => (
                  <div key={business._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{business.businessName}</p>
                        <p className="text-xs text-gray-500">
                          {getCategoryName(categories, business.categoryId)} • {new Date(business.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pending Approval
                    </Badge>
                  </div>
                ))}
                {pendingBusinesses.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={handleBulkApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All Pending
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Crown className="h-4 w-4 mr-2" />
                Premium Requests
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Verify Payments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Send Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Business Approvals</CardTitle>
                <CardDescription>Review and manage business registration requests</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleBulkApprove} size="sm" variant="outline">
                  Approve All
                </Button>
                <Button onClick={handleBulkReject} size="sm" variant="outline">
                  Reject All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLoading ? (
                    <TableSkeleton cols={7} />
                  ) : filteredBusinesses.map((business) => (
                    <TableRow key={business._id}>
                      <TableCell className="font-medium">{business.businessName}</TableCell>
                      <TableCell>{getUserName(users, business.createdBy as string)}</TableCell>
                      <TableCell>{getCategoryName(categories, business.categoryId)}</TableCell>
                      <TableCell>{new Date(business.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          ₹{business.paymentDetails.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ListingTypeBadge type={business.listingType} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(business._id, {
                              onSuccess: () => toast({
                                title: 'Approved',
                                description: `${business.businessName} has been approved`
                              })
                            })}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => rejectMutation.mutate({
                              id: business._id,
                              rejectionReason: 'Rejected by admin'
                            }, {
                              onSuccess: () => toast({
                                title: 'Rejected',
                                description: `${business.businessName} has been rejected`
                              })
                            })}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!pendingLoading && filteredBusinesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No pending business approvals found
                      </TableCell>
                    </TableRow>
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