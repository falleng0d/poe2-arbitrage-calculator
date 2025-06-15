import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { IconPicker } from '@/components/app/IconPicker';
import { getIconComponent } from '@/components/app/iconConstants';
import {
  Coins,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Currency } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CurrencyManagementProps {
  currencies: Currency[];
  onAddCurrency: (currency: Omit<Currency, 'id' | 'createdAt'>) => void;
  onUpdateCurrency: (id: string, updates: Partial<Currency>) => void;
  onDeleteCurrency: (id: string) => void;
}

interface CurrencyFormData {
  name: string;
  selectedIcon: string;
  customIcon?: string;
}

export const CurrencyManagement = ({
  currencies,
  onAddCurrency,
  onUpdateCurrency,
  onDeleteCurrency,
}: CurrencyManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<CurrencyFormData>({
    name: '',
    selectedIcon: 'DollarSign',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Currency name is required',
        variant: 'destructive',
      });
      return;
    }

    const isDuplicate = currencies.some(
      currency => 
        currency.name.toLowerCase() === formData.name.toLowerCase() &&
        currency.id !== editingCurrency?.id
    );

    if (isDuplicate) {
      toast({
        title: 'Error',
        description: 'A currency with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    if (editingCurrency) {
      onUpdateCurrency(editingCurrency.id, {
        name: formData.name.trim(),
        icon: formData.selectedIcon,
        isCustomIcon: !!formData.customIcon,
      });
      toast({
        title: 'Success',
        description: 'Currency updated successfully',
      });
    } else {
      onAddCurrency({
        name: formData.name.trim(),
        icon: formData.selectedIcon,
        isCustomIcon: !!formData.customIcon,
      });
      toast({
        title: 'Success',
        description: 'Currency added successfully',
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      selectedIcon: 'DollarSign',
    });
    setEditingCurrency(null);
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      name: currency.name,
      selectedIcon: currency.icon,
      customIcon: currency.isCustomIcon ? currency.icon : undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeleteCurrency(id);
    toast({
      title: 'Success',
      description: 'Currency deleted successfully',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Currency Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Currency</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Currency Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter currency name"
                  required
                />
              </div>
              
              <IconPicker
                selectedIcon={formData.selectedIcon}
                onIconSelect={(iconName) => setFormData({ ...formData, selectedIcon: iconName })}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCurrency ? 'Update' : 'Add'} Currency
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currencies.map((currency) => {
          const IconComponent = getIconComponent(currency.icon);
          return (
            <Card key={currency.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">{currency.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(currency)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Currency</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{currency.name}"? This action cannot be undone and will remove all associated conversion rates.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(currency.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {currency.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currencies.length === 0 && (
        <Card className="p-12 text-center">
          <CardContent>
            <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No currencies yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first currency to start setting up arbitrage calculations
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
