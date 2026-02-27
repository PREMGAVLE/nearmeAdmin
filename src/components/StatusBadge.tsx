import { Badge } from '@/components/ui/badge';

type StatusType = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  approved: { label: 'Approved', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  verified: { label: 'Verified', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  active: { label: 'Active', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  blocked: { label: 'Blocked', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  expired: { label: 'Expired', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  none: { label: 'None', className: 'bg-muted text-muted-foreground border-border' },
  new: { label: 'New', className: 'bg-info/15 text-info border-info/30 hover:bg-info/20' },
  contacted: { label: 'Contacted', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  converted: { label: 'Converted', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  confirmed: { label: 'Confirmed', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  completed: { label: 'Completed', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  paid: { label: 'Paid', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  refunded: { label: 'Refunded', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  premium_requested: { label: 'Premium Requested', className: 'bg-info/15 text-info border-info/30 hover:bg-info/20' },
  premium_approved: { label: 'Premium Approved', className: 'bg-success/15 text-success border-success/30 hover:bg-success/20' },
  premium_rejected: { label: 'Premium Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20' },
  lead: { label: 'Lead', className: 'bg-info/15 text-info border-info/30 hover:bg-info/20' },
  booking: { label: 'Booking', className: 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/20' },
  hybrid: { label: 'Hybrid', className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20' },
  leads: { label: 'Leads Only', className: 'bg-info/15 text-info border-info/30 hover:bg-info/20' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function PremiumBadge() {
  return (
    <Badge className="gradient-premium text-premium-foreground border-0 font-semibold">
      ★ Premium
    </Badge>
  );
}

export function ListingTypeBadge({ type }: { type: 'normal' | 'premium' }) {
  if (type === 'premium') return <PremiumBadge />;
  return <Badge variant="secondary">Normal</Badge>;
}
