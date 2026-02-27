import { useState } from 'react';
import { useLeads, useUpdateLeadStatus, useBulkAssignLeads } from '@/services/leadService';
import { useBusinesses } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getBusinessName, getBusinessById, getCategoryName } from '@/lib/helpers';
import type { Lead, LeadFilters } from '@/types';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({ page: 1, limit: 20 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBusinessId, setBulkBusinessId] = useState('');
  const { toast } = useToast();

  const { data, isLoading } = useLeads({ ...filters, search: search || undefined });
  const { data: bizData } = useBusinesses({ limit: 100 });
  const { data: userData } = useUsers({ limit: 1000 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const updateStatusMutation = useUpdateLeadStatus();
  const bulkAssignMutation = useBulkAssignLeads();
  const approvedBusinesses = bizData?.data?.items?.filter(b => b.approvalStatus === 'approved') || [];
  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const handleStatusChange = (id: string, status: Lead['status']) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => toast({ title: 'Lead Updated' }),
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    // To:
    if (!data?.data?.items) return;
    if (selectedIds.length === data.data.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.data.items.map(l => l._id));
    }
  };

  const handleBulkAssign = () => {
    if (!bulkBusinessId || selectedIds.length === 0) return;
    bulkAssignMutation.mutate({ leadIds: selectedIds, assignedBusinessId: bulkBusinessId }, {
      onSuccess: () => {
        toast({ title: 'Leads Assigned', description: `${selectedIds.length} leads assigned to business` });
        setSelectedIds([]);
        setBulkOpen(false);
        setBulkBusinessId('');
      },
    });
  };

  const selectedBiz = bulkBusinessId ? getBusinessById(approvedBusinesses, bulkBusinessId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Leads Management</h1>
          <p className="text-sm text-muted-foreground">Track, manage, and assign customer leads</p>
        </div>
        {selectedIds.length > 0 && (
          <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => setBulkOpen(true)}>
            <ListChecks className="h-4 w-4" /> Bulk Assign ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Bulk Assign Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bulk Assign Leads to Business</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedIds.length} leads selected for assignment</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Business</label>
              <Select value={bulkBusinessId} onValueChange={setBulkBusinessId}>
                <SelectTrigger><SelectValue placeholder="Choose a business" /></SelectTrigger>
                <SelectContent>
                  {approvedBusinesses.map(b => (
                    <SelectItem key={b._id} value={b._id}>{b.businessName} — {b.address.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBiz && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Category:</span> <span className="font-medium">{getCategoryName(categories, selectedBiz.categoryId)}</span></p>
                <p><span className="text-muted-foreground">Business Type:</span> <StatusBadge status={selectedBiz.businessType} /></p>
                <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{selectedBiz.address.city}</span></p>
              </div>
            )}
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleBulkAssign}
              disabled={!bulkBusinessId || bulkAssignMutation.isPending}>
              {bulkAssignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Customer Name</p><p className="font-medium">{selectedLead.customerName}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedLead.phone}</p></div>
                <div><p className="text-muted-foreground">Status</p><StatusBadge status={selectedLead.status} /></div>
                <div><p className="text-muted-foreground">Lead Type</p><StatusBadge status={selectedLead.leadType || 'lead'} /></div>
                <div><p className="text-muted-foreground">Assigned Salesman</p><p className="font-medium">{getUserName(users, selectedLead.assignedTo as string)}</p></div>
                <div><p className="text-muted-foreground">Source Business</p><p className="font-medium">{selectedLead.businessId ? getBusinessName(approvedBusinesses, selectedLead.businessId) : '—'}</p></div>
                <div><p className="text-muted-foreground">Assigned Business</p><p className="font-medium">{selectedLead.assignedBusinessId ? getBusinessName(approvedBusinesses, selectedLead.assignedBusinessId) : '—'}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Message</p><p className="font-medium">{selectedLead.message}</p></div>
                <div><p className="text-muted-foreground">Created At</p><p className="font-medium">{new Date(selectedLead.createdAt).toLocaleString()}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search leads..."
            filters={[
              { key: 'status', label: 'Status', value: filters.status || 'all', onChange: (v) => setFilters(p => ({ ...p, status: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'converted', label: 'Converted' }] },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={data?.data?.items && data.data.items.length > 0 && selectedIds.length === data.data.items.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Lead Type</TableHead>
                <TableHead>Source Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assigned Business</TableHead>
                <TableHead>Assigned Salesman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={10} /> : data?.data?.items?.map((lead) => {
                const srcBiz = lead.businessId ? getBusinessById(approvedBusinesses, lead.businessId) : null;
                const assignBiz = lead.assignedBusinessId ? getBusinessById(approvedBusinesses, lead.assignedBusinessId) : null;
                return (
                  <TableRow key={lead._id} className={selectedIds.includes(lead._id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(lead._id)} onCheckedChange={() => toggleSelect(lead._id)} />
                    </TableCell>
                    <TableCell className="font-medium">{lead.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.phone}</TableCell>
                    <TableCell><StatusBadge status={lead.leadType || 'lead'} /></TableCell>
                    <TableCell className="text-muted-foreground">{srcBiz?.businessName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{srcBiz ? getCategoryName(categories, srcBiz.categoryId) : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{assignBiz?.businessName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{getUserName(users, lead.assignedTo as string)}</TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedLead(lead); setDetailOpen(true); }}>
                          <Info className="h-4 w-4" />
                        </Button>
                        <Select value={lead.status} onValueChange={(v: Lead['status']) => handleStatusChange(lead._id, v)}>
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && (!data?.data?.items || data.data.items.length === 0) && (

                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No leads found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {data.data.pagination.page} of {data.data.pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.data.pagination.page <= 1} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={data.data.pagination.page >= data.data.pagination.totalPages} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
