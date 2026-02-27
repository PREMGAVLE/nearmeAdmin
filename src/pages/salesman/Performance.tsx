import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses } from '@/services/businessService';
import { StatsCard } from '@/components/StatsCard';
import { StatsSkeleton } from '@/components/TableSkeleton';
import { Building2, Crown, CreditCard, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export default function SalesmanPerformance() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats('salesman', user?._id);
  const { data: bizData } = useBusinesses({ createdBy: user?._id });

  const businesses = bizData?.data || [];
  const approved = businesses.filter(b => b.approvalStatus === 'approved').length;
  const pending = businesses.filter(b => b.approvalStatus === 'pending').length;
  const rejected = businesses.filter(b => b.approvalStatus === 'rejected').length;

  const pieData = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: rejected },
  ].filter(d => d.value > 0);

  const monthlyData = [
    { month: 'Oct', count: 1 },
    { month: 'Nov', count: 1 },
    { month: 'Dec', count: 2 },
    { month: 'Jan', count: 2 },
    { month: 'Feb', count: 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">My Performance</h1>
        <p className="text-sm text-muted-foreground">Track your field operations metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? <StatsSkeleton count={4} /> : stats && (
          <>
            <StatsCard title="Total Businesses" value={stats.totalBusinesses} icon={Building2} variant="primary" />
            <StatsCard title="Approved" value={stats.approvedToday} icon={CheckCircle} variant="success" />
            <StatsCard title="Pending" value={stats.pendingApprovals} icon={Clock} variant="warning" />
            <StatsCard title="Revenue Collected" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={CreditCard} variant="info" />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card card-shadow p-4 sm:p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Approval Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data yet</p>
          )}
        </div>

        <div className="rounded-xl border bg-card card-shadow p-4 sm:p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Monthly Additions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(25, 15%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(263, 70%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
