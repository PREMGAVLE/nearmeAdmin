import { useState } from 'react';
import { Tags, Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const { data, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name }, {
      onSuccess: () => { toast({ title: 'Category Created' }); setCreateOpen(false); setName(''); },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: editId, name }, {
      onSuccess: () => { toast({ title: 'Category Updated' }); setEditOpen(false); setName(''); },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage business listing categories</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Category Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2"><Label>Category Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Businesses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableSkeleton cols={4} /> : data?.data?.map((cat, i) => (
              <TableRow key={cat._id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  <Tags className="h-4 w-4 text-primary" /> {cat.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{cat.businessCount ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditId(cat._id); setName(cat.name); setEditOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive"
                      onClick={() => deleteMutation.mutate(cat._id, { onSuccess: () => toast({ title: 'Deleted' }) })}
                      disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!data?.data || data.data.length === 0) && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
