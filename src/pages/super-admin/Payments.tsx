import { useState } from 'react';
import { useBusinesses, useVerifyPayment } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { StatusBadge } from '@/components/StatusBadge';
import { StatsCard } from '@/components/StatsCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton, StatsSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { useDashboardStats } from '@/services/dashboardService';
import { getUserName } from '@/lib/helpers';
import type { BusinessFilters } from '@/types';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BusinessFilters>({ page: 1, limit: 20 });
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useDashboardStats('super_admin');
  const { data: businessesData, isLoading } = useBusinesses({ ...filters, search: search || undefined, limit: 1000 });
  const { data: userData } = useUsers({ limit: 1000 });

  const users = userData?.data || [];
  const businesses = businessesData?.data || [];
  const verifyMutation = useVerifyPayment();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Payments & Revenue</h1>
        <p className="text-sm text-muted-foreground">Track manual payments and revenue across the platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statsLoading ? <StatsSkeleton count={3} /> : stats && (
          <>
            <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={CreditCard} variant="success" />
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={TrendingUp} variant="warning" />
            <StatsCard title="Verified Payments" value={stats.verifiedPayments} icon={CheckCircle} variant="info" />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search payments..." />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={7} /> : businesses.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.businessName}</TableCell>
                  <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                  <TableCell className="font-semibold">₹{b.paymentDetails.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary" className="uppercase text-xs">{b.paymentDetails.paymentMode}</Badge></TableCell>
                  <TableCell><StatusBadge status={b.paymentDetails.paymentStatus} /></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {b.paymentDetails.paymentStatus === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-success gap-1"
                          onClick={() => verifyMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Payment Verified' }) })}
                          disabled={verifyMutation.isPending}>
                          <CheckCircle className="h-4 w-4" /> Verify
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && businesses.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payment records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
