import { Building2, Users, CreditCard, TrendingUp, ClipboardCheck, Crown, MessageSquare, CalendarCheck } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton, TableSkeleton } from '@/components/TableSkeleton';
import { getUserName } from '@/lib/helpers';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats('super_admin');
  const { data: businessesData, isLoading: businessesLoading } = useBusinesses({ limit: 10 });
  const { data: userData } = useUsers({ limit: 1000 });

  const users = userData?.data?.items || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Complete overview of nearmeb2b.city platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statsLoading ? <StatsSkeleton count={8} /> : stats && (
          <>
            <StatsCard title="Total Businesses" value={stats?.totalBusinesses || 0} icon={Building2} variant="default" />
            <StatsCard title="Premium Listings" value={stats?.premiumListings || 0} icon={Crown} variant="premium" />
            <StatsCard title="Total Salesmen" value={stats?.totalSalesmen || 0} icon={Users} variant="info" />
            <StatsCard title="Pending Approvals" value={stats?.pendingApprovals || 0} icon={ClipboardCheck} variant="warning" />
            <StatsCard title="Verified Payments" value={stats?.verifiedPayments || 0} icon={TrendingUp} variant="default" />
            <StatsCard title="Total Leads" value={stats?.totalLeads || 0} icon={MessageSquare} variant="info" />
            <StatsCard title="Total Bookings" value={stats?.totalBookings || 0} icon={CalendarCheck} variant="success" />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-4 sm:p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Recent Businesses</h3>
        </div>
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
              {businessesLoading ? <TableSkeleton cols={6} /> : businessesData?.data?.items?.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.businessName}</TableCell>
                  <TableCell>{b.address.city}</TableCell>
                  <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                  <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                  <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                  <TableCell className="text-muted-foreground">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
              {!businessesLoading && (!businessesData?.data?.items || businessesData.data.items.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No businesses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
