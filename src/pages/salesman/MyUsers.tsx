import { useState } from 'react';
import { useUsersBySalesman } from '@/services/userService';
import { useCreateBusiness } from '@/services/businessService';
import { useCategories } from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UserPlus, Eye, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Link, useNavigate } from 'react-router-dom';

export default function MyUsers() {
    const { data, isLoading, refetch } = useUsersBySalesman();
    const { data: categoriesData } = useCategories();
    const createBusinessMutation = useCreateBusiness();
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const navigate = useNavigate();
    const [businessForm, setBusinessForm] = useState({
        businessName: '',
        categoryId: '',
        businessType: 'LEAD' as 'LEAD' | 'BOOKING' | 'HYBRID',
        contactNumbers: {
            primary: '',
            whatsapp: '',
            alternate: ''
        },
        contactPersonName: '',
        email: '',
        address: {
            street: '',
            landmark: '',
            area: '',
            city: 'Burhanpur',
            state: 'Madhya Pradesh',
            pincode: ''
        },
        description: '',
        openingTime: '',
        closingTime: '',
        serviceDays: [],
        charges: 0,
        listingType: 'normal' as const,
        paymentDetails: undefined
    });

    const handleCreateBusiness = () => {
        if (!selectedUserId) return;

        const payload = {
            ...businessForm,
            ownerId: selectedUserId,
            createdBy: selectedUserId
        };

        createBusinessMutation.mutate(payload, {
            onSuccess: () => {
                toast({
                    title: 'Business Created',
                    description: 'Business has been created successfully and is pending approval'
                });
                setIsBusinessModalOpen(false);
                setBusinessForm({
                    businessName: '',
                    categoryId: '',
                    businessType: 'LEAD',
                    contactNumbers: { primary: '', whatsapp: '', alternate: '' },
                    contactPersonName: '',
                    email: '',
                    address: { street: '', landmark: '', area: '', city: 'Burhanpur', state: 'Madhya Pradesh', pincode: '' },
                    description: '',
                    openingTime: '',
                    closingTime: '',
                    serviceDays: [],
                    charges: 0,
                    listingType: 'normal',
                    paymentDetails: undefined
                });
                refetch();
            },
            onError: (error: any) => {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to create business',
                    variant: 'destructive'
                });
            }
        });
    };

    const categories = categoriesData?.items || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">My Users</h1>
                    <p className="text-sm text-muted-foreground">Users created by you</p>
                </div>
                <Button className="gradient-primary text-primary-foreground gap-2">
                    <UserPlus className="h-4 w-4" /> Create New User
                </Button>
            </div>

            <div className="rounded-xl border bg-card card-shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Businesses</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.data?.items?.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.mobile}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.city}</TableCell>
                                <TableCell><StatusBadge status={user.status} /></TableCell>
                                <TableCell>{user.businessCount || 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Dialog open={isBusinessModalOpen && selectedUserId === user._id} onOpenChange={(open) => {
                                            setIsBusinessModalOpen(open);
                                            if (!open) setSelectedUserId('');
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/salesman/add-business?userId=${user._id}`)}
                                                >
                                                    <Building2 className="h-4 w-4 mr-1" />
                                                    Add Business
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Add Business for {user.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="businessName">Business Name *</Label>
                                                        <Input
                                                            id="businessName"
                                                            value={businessForm.businessName}
                                                            onChange={(e) => setBusinessForm(p => ({ ...p, businessName: e.target.value }))}
                                                            placeholder="Enter business name"
                                                            maxLength={120}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="categoryId">Category *</Label>
                                                        <Select value={businessForm.categoryId} onValueChange={(v) => setBusinessForm(p => ({ ...p, categoryId: v }))}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="primary">Primary Contact *</Label>
                                                        <Input
                                                            id="primary"
                                                            value={businessForm.contactNumbers.primary}
                                                            onChange={(e) => setBusinessForm(p => ({
                                                                ...p,
                                                                contactNumbers: { ...p.contactNumbers, primary: e.target.value }
                                                            }))}
                                                            placeholder="Primary mobile number"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="whatsapp">WhatsApp</Label>
                                                        <Input
                                                            id="whatsapp"
                                                            value={businessForm.contactNumbers.whatsapp}
                                                            onChange={(e) => setBusinessForm(p => ({
                                                                ...p,
                                                                contactNumbers: { ...p.contactNumbers, whatsapp: e.target.value }
                                                            }))}
                                                            placeholder="WhatsApp number"
                                                            maxLength={10}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="businessType">Business Type *</Label>
                                                        <Select value={businessForm.businessType} onValueChange={(v: any) => setBusinessForm(p => ({ ...p, businessType: v }))}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="LEAD">Lead Generation</SelectItem>
                                                                <SelectItem value="BOOKING">Booking System</SelectItem>
                                                                <SelectItem value="HYBRID">Hybrid (Lead + Booking)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={businessForm.email}
                                                            onChange={(e) => setBusinessForm(p => ({ ...p, email: e.target.value }))}
                                                            placeholder="Business email"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="pincode">Pincode *</Label>
                                                        <Input
                                                            id="pincode"
                                                            value={businessForm.address.pincode}
                                                            onChange={(e) => setBusinessForm(p => ({
                                                                ...p,
                                                                address: { ...p.address, pincode: e.target.value }
                                                            }))}
                                                            placeholder="6-digit pincode"
                                                            maxLength={6}
                                                            pattern="\d{6}"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="listingType">Listing Type *</Label>
                                                        <Select value={businessForm.listingType} onValueChange={(v: 'normal' | 'premium') => setBusinessForm(p => ({ ...p, listingType: v }))}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="normal">Normal</SelectItem>
                                                                <SelectItem value="premium">Premium</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label htmlFor="description">Description</Label>
                                                        <Input
                                                            id="description"
                                                            value={businessForm.description}
                                                            onChange={(e) => setBusinessForm(p => ({ ...p, description: e.target.value }))}
                                                            placeholder="Business description"
                                                            maxLength={2000}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label htmlFor="street">Address</Label>
                                                        <Input
                                                            id="street"
                                                            value={businessForm.address.street}
                                                            onChange={(e) => setBusinessForm(p => ({
                                                                ...p,
                                                                address: { ...p.address, street: e.target.value }
                                                            }))}
                                                            placeholder="Street address"
                                                            maxLength={120}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Payment Details - Only for Premium */}
                                                {businessForm.listingType === 'premium' && (
                                                    <div className="space-y-4 border-t pt-4 mt-4">
                                                        <h4 className="font-medium">Payment Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Amount *</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={businessForm.paymentDetails?.amount || ''}
                                                                    onChange={(e) => setBusinessForm(p => ({
                                                                        ...p,
                                                                        paymentDetails: {
                                                                            ...p.paymentDetails,
                                                                            amount: Number(e.target.value)
                                                                        }
                                                                    }))}
                                                                    placeholder="Enter amount"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Payment Mode *</Label>
                                                                <Select value={businessForm.paymentDetails?.paymentMode || ''} onValueChange={(v) => setBusinessForm(p => ({
                                                                    ...p,
                                                                    paymentDetails: {
                                                                        ...p.paymentDetails,
                                                                        paymentMode: v
                                                                    }
                                                                }))}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select payment mode" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="cash">Cash</SelectItem>
                                                                        <SelectItem value="upi">UPI</SelectItem>
                                                                        <SelectItem value="online">Online</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label>Payment Note</Label>
                                                                <Input
                                                                    value={businessForm.paymentDetails?.paymentNote || ''}
                                                                    onChange={(e) => setBusinessForm(p => ({
                                                                        ...p,
                                                                        paymentDetails: {
                                                                            ...p.paymentDetails,
                                                                            paymentNote: e.target.value
                                                                        }
                                                                    }))}
                                                                    placeholder="Optional payment note"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2 mt-6">
                                                    <Button variant="outline" onClick={() => setIsBusinessModalOpen(false)}>Cancel</Button>
                                                    <Button
                                                        onClick={handleCreateBusiness}
                                                        disabled={createBusinessMutation.isPending ||
                                                            !businessForm.businessName ||
                                                            !businessForm.categoryId ||
                                                            !businessForm.contactNumbers.primary ||
                                                            !businessForm.address.pincode ||
                                                            (businessForm.listingType === 'premium' && (!businessForm.paymentDetails?.amount || !businessForm.paymentDetails?.paymentMode))
                                                        }
                                                    >
                                                        {createBusinessMutation.isPending ? 'Creating...' : 'Create Business'}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}