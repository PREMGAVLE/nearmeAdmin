import { Building2, CheckCircle, Clock, Crown, CreditCard } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses } from '@/services/businessService';
import { useCategories } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton, TableSkeleton } from '@/components/TableSkeleton';
import { getCategoryName } from '@/lib/helpers';

export default function SalesmanDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats('salesman', user?._id);
  const { data: businessesData, isLoading: businessesLoading } = useBusinesses({
    createdBy: user?._id,
    limit: 10,
  });
  const { data: categoryData } = useCategories({ limit: 100 });

  const categories = categoryData?.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">Your field operations overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsLoading ? <StatsSkeleton count={5} /> : stats && (
          <>
            <StatsCard title="Total Added" value={stats.totalBusinesses} icon={Building2} variant="primary" />
            <StatsCard title="Approved" value={stats.approvedToday} icon={CheckCircle} variant="success" />
            <StatsCard title="Pending" value={stats.pendingApprovals} icon={Clock} variant="warning" />
            <StatsCard title="Premium Sold" value={stats.premiumRequests} icon={Crown} variant="premium" />
            <StatsCard title="Collected" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={CreditCard} variant="info" />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">My Recent Businesses</h3>
        </div>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businessesLoading ? <TableSkeleton cols={5} /> : businessesData?.data?.map((b) => (
              <TableRow key={b._id}>
                <TableCell className="font-medium">{b.businessName}</TableCell>
                <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                <TableCell className="text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!businessesLoading && (!businessesData?.data || businessesData.data.length === 0) && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No businesses yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
