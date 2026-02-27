import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';

interface PendingApprovalsTableProps {
  businesses: any[];
  users: any[];
  categories: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export function PendingApprovalsTable({ 
  businesses, users, categories, onApprove, onReject, isLoading 
}: PendingApprovalsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [documentOpen, setDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; type: string } | null>(null);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || business.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(filteredBusinesses.map(b => b._id));
    } else {
      setSelectedBusinesses([]);
    }
  };

  const handleSelectBusiness = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBusinesses(prev => [...prev, id]);
    } else {
      setSelectedBusinesses(prev => prev.filter(bId => bId !== id));
    }
  };

  const handleBulkApprove = () => {
    selectedBusinesses.forEach(id => onApprove(id));
    setSelectedBusinesses([]);
  };

  const handleBulkReject = () => {
    selectedBusinesses.forEach(id => onReject(id));
    setSelectedBusinesses([]);
  };

  const handleViewDocument = (business: any) => {
    if (business.verification?.document?.file?.url) {
      setSelectedDocument({
        url: business.verification.document.file.url,
        type: business.verification.document.type || 'document'
      });
      setDocumentOpen(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Business Approvals</CardTitle>
            <CardDescription>Review and manage business registration requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {filteredBusinesses.length} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search businesses by name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full lg:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedBusinesses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedBusinesses.length} businesses selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No pending approvals</h3>
                      <p className="text-gray-500">All business registrations have been processed</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses.map((business) => (
                  <TableRow key={business._id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedBusinesses.includes(business._id)}
                        onCheckedChange={(checked) => handleSelectBusiness(business._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{business.businessName}</TableCell>
                    <TableCell>{users.find(u => u._id === business.createdBy)?.name || 'Unknown'}</TableCell>
                    <TableCell>{categories.find(c => c._id === business.categoryId)?.name || 'N/A'}</TableCell>
                    <TableCell>{business.address?.city || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">₹{business.paymentDetails?.amount || 0}</span>
                        <StatusBadge status={business.paymentDetails?.paymentStatus || 'pending'} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <ListingTypeBadge type={business.listingType || 'normal'} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {business.verification?.document?.file?.url ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDocument(business)}
                          title="View Document"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">No doc</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-8"
                          onClick={() => onApprove(business._id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8"
                          onClick={() => onReject(business._id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Document Dialog */}
        <Dialog open={documentOpen} onOpenChange={setDocumentOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Verification Document</DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Document Type: <span className="font-medium">{selectedDocument.type}</span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={selectedDocument.url} 
                    alt="Verification Document" 
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                      e.currentTarget.alt = 'Document not available';
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                  <Button variant="secondary" onClick={() => setDocumentOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}