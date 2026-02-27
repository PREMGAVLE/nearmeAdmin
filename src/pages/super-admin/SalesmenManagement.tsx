import { useState } from 'react';
import { useUsers, useToggleBlockUser, useCreateUser, useActivateSubscription } from '@/services/userService';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Ban, CheckCircle, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableHeader } from '@/components/DataTableHeader';
import type { UserFilters, Subscription } from '@/types';

export default function SalesmenManagement() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 20, role: 'salesman' });
  const [createOpen, setCreateOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '' });
  const [subData, setSubData] = useState<Partial<Subscription>>({ planType: '', startDate: '', expiryDate: '', status: 'active' });
  const { toast } = useToast();

  const { data, isLoading } = useUsers({ ...filters, search: search || undefined });
  const toggleBlockMutation = useToggleBlockUser();
  const createMutation = useCreateUser();
  const subMutation = useActivateSubscription();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, role: 'salesman' }, {
      onSuccess: () => {
        toast({ title: 'Salesman Created' });
        setCreateOpen(false);
        setFormData({ name: '', mobile: '', email: '' });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleActivateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    subMutation.mutate({ id: selectedUserId, subscription: subData }, {
      onSuccess: () => {
        toast({ title: 'Subscription Activated' });
        setSubOpen(false);
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Salesman Management</h1>
          <p className="text-sm text-muted-foreground">Manage field sales agents</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2">
              <UserPlus className="h-4 w-4" /> Add Salesman
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Salesman</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Salesman'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Modal */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activate Subscription</DialogTitle></DialogHeader>
          <form onSubmit={handleActivateSubscription} className="space-y-4">
            <div className="space-y-2"><Label>Plan Type</Label><Input value={subData.planType} onChange={e => setSubData(p => ({ ...p, planType: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={subData.startDate} onChange={e => setSubData(p => ({ ...p, startDate: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={subData.expiryDate} onChange={e => setSubData(p => ({ ...p, expiryDate: e.target.value }))} required /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={subMutation.isPending}>
              {subMutation.isPending ? 'Activating...' : 'Activate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search salesmen..." />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={7} /> : data?.data?.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">{s.mobile}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell><StatusBadge status={s.subscription?.status || 'none'} /></TableCell>
                  <TableCell className="text-muted-foreground">{s.subscription?.expiryDate ? new Date(s.subscription.expiryDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className={s.status === 'active' ? 'text-destructive' : 'text-success'}
                        onClick={() => toggleBlockMutation.mutate(s._id, { onSuccess: () => toast({ title: 'Updated' }) })} disabled={toggleBlockMutation.isPending}>
                        {s.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-premium" onClick={() => { setSelectedUserId(s._id); setSubOpen(true); }}>
                        <Crown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data || data.data.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No salesmen found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
