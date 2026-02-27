import { useState } from 'react';
import { useBookings, useUpdateBookingStatus, useUpdateBookingPaymentStatus } from '@/services/bookingService';
import { useBusinesses } from '@/services/businessService';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBusinessName } from '@/lib/helpers';
import type { Booking, BookingFilters } from '@/types';

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({ page: 1, limit: 20 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useBookings({ ...filters, search: search || undefined });
  const { data: bizData } = useBusinesses({ limit: 100 });
  const updateStatusMutation = useUpdateBookingStatus();
  const updatePaymentMutation = useUpdateBookingPaymentStatus();

  const businesses = bizData?.data || [];

  const handleStatusChange = (id: string, bookingStatus: Booking['bookingStatus']) => {
    updateStatusMutation.mutate({ id, bookingStatus }, {
      onSuccess: () => toast({ title: 'Booking Updated' }),
    });
  };

  const handlePaymentChange = (id: string, paymentStatus: Booking['paymentStatus']) => {
    updatePaymentMutation.mutate({ id, paymentStatus }, {
      onSuccess: () => toast({ title: 'Payment Status Updated' }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Bookings Management</h1>
        <p className="text-sm text-muted-foreground">Track and manage customer bookings</p>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Business</p><p className="font-medium">{getBusinessName(businesses, selectedBooking.businessId as string)}</p></div>
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selectedBooking.customerName || '—'}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedBooking.phone || '—'}</p></div>
                <div><p className="text-muted-foreground">Booking Date</p><p className="font-medium">{new Date(selectedBooking.bookingDate).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Booking Status</p><StatusBadge status={selectedBooking.bookingStatus} /></div>
                <div><p className="text-muted-foreground">Payment Status</p><StatusBadge status={selectedBooking.paymentStatus} /></div>
                <div><p className="text-muted-foreground">Created At</p><p className="font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</p></div>
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
            searchPlaceholder="Search bookings..."
            filters={[
              { key: 'bookingStatus', label: 'Status', value: filters.bookingStatus || 'all', onChange: (v) => setFilters(p => ({ ...p, bookingStatus: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'completed', label: 'Completed' }] },
              { key: 'paymentStatus', label: 'Payment', value: filters.paymentStatus || 'all', onChange: (v) => setFilters(p => ({ ...p, paymentStatus: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'refunded', label: 'Refunded' }] },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={7} /> : data?.data?.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{getBusinessName(businesses, booking.businessId as string)}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.customerName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.phone || '—'}</TableCell>
                  <TableCell><StatusBadge status={booking.bookingStatus} /></TableCell>
                  <TableCell><StatusBadge status={booking.paymentStatus} /></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBooking(booking); setDetailOpen(true); }}>
                        <Info className="h-4 w-4" />
                      </Button>
                      <Select value={booking.bookingStatus} onValueChange={(v: Booking['bookingStatus']) => handleStatusChange(booking._id, v)}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={booking.paymentStatus} onValueChange={(v: Booking['paymentStatus']) => handlePaymentChange(booking._id, v)}>
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data || data.data.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.pagination.page <= 1} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
