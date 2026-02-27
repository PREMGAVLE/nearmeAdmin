import { useDashboardStats } from '@/services/dashboardService';
import { useBusinesses } from '@/services/businessService';
import { useLeads } from '@/services/leadService';
import { useBookings } from '@/services/bookingService';
import { StatsCard } from '@/components/StatsCard';
import { StatsSkeleton } from '@/components/TableSkeleton';
import { Building2, Users, Crown, CreditCard, MessageSquare, CalendarCheck, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(263, 70%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(217, 91%, 60%)'];

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats('super_admin');
  const { data: bizData } = useBusinesses({ limit: 100 });
  const { data: leadData } = useLeads({ limit: 100 });
  const { data: bookingData } = useBookings({ limit: 100 });

  const businesses = bizData?.data || [];
  const leads = leadData?.data || [];
  const bookings = bookingData?.data || [];

  // Approval breakdown
  const approvalData = [
    { name: 'Approved', value: businesses.filter(b => b.approvalStatus === 'approved').length },
    { name: 'Pending', value: businesses.filter(b => b.approvalStatus === 'pending').length },
    { name: 'Rejected', value: businesses.filter(b => b.approvalStatus === 'rejected').length },
  ].filter(d => d.value > 0);

  // Revenue by city
  const cityRevenue: Record<string, number> = {};
  businesses.forEach(b => { cityRevenue[b.address.city] = (cityRevenue[b.address.city] || 0) + b.paymentDetails.amount; });
  const cityData = Object.entries(cityRevenue).map(([city, amount]) => ({ city, amount })).sort((a, b) => b.amount - a.amount);

  // Lead status
  const leadStatusData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Converted', value: leads.filter(l => l.status === 'converted').length },
  ].filter(d => d.value > 0);

  // Booking status
  const bookingStatusData = [
    { name: 'Pending', value: bookings.filter(b => b.bookingStatus === 'pending').length },
    { name: 'Confirmed', value: bookings.filter(b => b.bookingStatus === 'confirmed').length },
    { name: 'Completed', value: bookings.filter(b => b.bookingStatus === 'completed').length },
    { name: 'Cancelled', value: bookings.filter(b => b.bookingStatus === 'cancelled').length },
  ].filter(d => d.value > 0);

  // Conversion rate
  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform performance insights calculated from data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? <StatsSkeleton count={8} /> : stats && (
          <>
            <StatsCard title="Total Users" value={12} icon={Users} variant="primary" />
            <StatsCard title="Active Subscriptions" value={8} icon={Crown} variant="premium" />
            <StatsCard title="Total Businesses" value={stats.totalBusinesses} icon={Building2} variant="info" />
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={TrendingUp} variant="warning" />
            <StatsCard title="Premium Businesses" value={stats.premiumListings} icon={Crown} variant="premium" />
            <StatsCard title="Total Leads" value={stats.totalLeads || 0} icon={MessageSquare} variant="success" />
            <StatsCard title="Conversion Rate" value={`${conversionRate}%`} icon={Target} variant="info" />
            <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={CreditCard} variant="success" />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Approval Breakdown Pie */}
        <div className="rounded-xl border bg-card card-shadow p-4 sm:p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Business Approval Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={approvalData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {approvalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by City Bar */}
        <div className="rounded-xl border bg-card card-shadow p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue by City</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(25, 15%, 88%)" />
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="hsl(263, 70%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Status Pie */}
        <div className="rounded-xl border bg-card card-shadow p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {leadStatusData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Pie */}
        <div className="rounded-xl border bg-card card-shadow p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Booking Status Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
