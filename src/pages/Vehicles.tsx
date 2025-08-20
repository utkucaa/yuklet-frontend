import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMyVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle, type VehicleType, type Vehicle } from '@/hooks/useVehicles';
import { useAuthStore } from '@/store/authStore';
import { Truck, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vehicleSchema = z.object({
  vehicleType: z.enum(['TRUCK', 'VAN', 'TRAILER', 'PICKUP']),
  plateNumber: z.string().min(1, 'Plaka numarası zorunludur'),
  maxWeightKg: z.number().min(1, 'Maksimum ağırlık zorunludur'),
  hasCrane: z.boolean(),
  hasTemperatureControl: z.boolean(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export function Vehicles() {
  const { user } = useAuthStore();
  const { data: vehicles, isLoading } = useMyVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: 'TRUCK',
      plateNumber: '',
      maxWeightKg: 0,
      hasCrane: false,
      hasTemperatureControl: false,
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    if (editingVehicle) {
      updateVehicle.mutate({ id: editingVehicle, ...data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingVehicle(null);
          form.reset();
        },
      });
    } else {
      createVehicle.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle.id);
    form.reset({
      vehicleType: vehicle.vehicleType,
      plateNumber: vehicle.plateNumber,
      maxWeightKg: vehicle.maxWeightKg,
      hasCrane: vehicle.hasCrane,
      hasTemperatureControl: vehicle.hasTemperatureControl,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (vehicleId: number) => {
    if (confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      deleteVehicle.mutate(vehicleId);
    }
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'TRUCK':
        return <Truck className="h-5 w-5" />;
      case 'VAN':
        return <Truck className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    switch (type) {
      case 'TRUCK':
        return 'Kamyon';
      case 'VAN':
        return 'Kamyonet';
      case 'TRAILER':
        return 'Römork';
      case 'PICKUP':
        return 'Pickup';
      default:
        return type;
    }
  };

  if (user?.role !== 'CARRIER') {
    return (
      <AuthGuard>
        <div className="min-h-screen">
          <Container className="py-8">
            <PageHeader title="Araçlar" description="Araçlarınızı yönetin" />
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bu sayfa sadece taşıyıcılar içindir</h3>
                <p className="text-gray-500">Araç yönetimi özelliği sadece taşıyıcı hesapları için mevcuttur</p>
              </CardContent>
            </Card>
          </Container>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Container className="py-8">
          <PageHeader 
            title="Araçlar" 
            description="Araçlarınızı yönetin"
          />
          
          <div className="flex justify-end mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingVehicle(null);
                  form.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Araç Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicleType">Araç Tipi</Label>
                    <Select
                      value={form.watch('vehicleType')}
                      onValueChange={(value) => form.setValue('vehicleType', value as VehicleType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRUCK">Kamyon</SelectItem>
                        <SelectItem value="VAN">Kamyonet</SelectItem>
                        <SelectItem value="TRAILER">Römork</SelectItem>
                        <SelectItem value="PICKUP">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plateNumber">Plaka Numarası</Label>
                    <Input
                      {...form.register('plateNumber')}
                      placeholder="34ABC123"
                    />
                    {form.formState.errors.plateNumber && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.plateNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="maxWeightKg">Maksimum Ağırlık (kg)</Label>
                    <Input
                      type="number"
                      {...form.register('maxWeightKg', { valueAsNumber: true })}
                      placeholder="12000"
                    />
                    {form.formState.errors.maxWeightKg && (
                      <p className="text-red-600 text-sm mt-1">{form.formState.errors.maxWeightKg.message}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasCrane"
                      checked={form.watch('hasCrane')}
                      onCheckedChange={(checked) => form.setValue('hasCrane', checked)}
                    />
                    <Label htmlFor="hasCrane">Vinç var mı?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasTemperatureControl"
                      checked={form.watch('hasTemperatureControl')}
                      onCheckedChange={(checked) => form.setValue('hasTemperatureControl', checked)}
                    />
                    <Label htmlFor="hasTemperatureControl">Sıcaklık kontrolü var mı?</Label>
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending}>
                      {editingVehicle ? 'Güncelle' : 'Ekle'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      İptal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : vehicles?.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz araç eklenmemiş</h3>
                  <p className="text-gray-500">İlk aracınızı ekleyerek başlayın</p>
                </CardContent>
              </Card>
            ) : (
              vehicles?.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getVehicleIcon(vehicle.vehicleType)}
                      <span>{vehicle.plateNumber}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tip:</span>
                        <Badge variant="secondary">{getVehicleTypeLabel(vehicle.vehicleType)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Maks. Ağırlık:</span>
                        <span className="text-sm font-medium">{vehicle.maxWeightKg} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vinç:</span>
                        {vehicle.hasCrane ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sıcaklık Kontrolü:</span>
                        {vehicle.hasTemperatureControl ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={deleteVehicle.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}
