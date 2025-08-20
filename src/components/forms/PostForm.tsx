import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateCargo, useCreateTransportOffer } from '@/hooks/useListings';
import { mockCities } from '@/data/mockData';
import type { ListingType, VehicleType } from '@/types';
import { ImagePlus, X, Calendar, Package, DollarSign, FileText } from 'lucide-react';

const listingSchema = z
  .object({
    type: z.enum(['LOAD', 'CAPACITY']),
    title: z
      .string()
      .min(5, 'Başlık en az 5 karakter olmalıdır')
      .max(100)
      .optional(),
    fromCity: z.string().min(1, 'Nereden bilgisi zorunludur'),
    toCity: z.string().optional(),
    pickupDate: z.string().optional(),
    deliveryDate: z.string().optional(),
    capacityTons: z
      .number({ invalid_type_error: 'Lütfen sayısal bir değer girin (örn: 20 veya 20.5)' })
      .min(0.1, 'Kapasite en az 0.1 ton olmalıdır')
      .max(50)
      .optional(),
    vehicleType: z.enum(['TIR', 'Kamyon', 'Kamyonet', 'Panelvan']).optional(),
    price: z.number().min(1, "Fiyat 1 TL'den fazla olmalıdır").optional(),
    currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
    notes: z
      .string()
      .max(1000, 'Notlar 1000 karakterden fazla olamaz')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'LOAD') {
      if (!data.title || data.title.trim().length < 5) {
        ctx.addIssue({
          path: ['title'],
          code: 'custom',
          message: 'Yük ilanı için başlık zorunludur',
        });
      }
    }
    if (data.type === 'CAPACITY') {
      if (!data.pickupDate) {
        ctx.addIssue({ path: ['pickupDate'], code: 'custom', message: 'Müsait tarih zorunludur' });
      }
      if (data.capacityTons === undefined || Number.isNaN(data.capacityTons)) {
        ctx.addIssue({ path: ['capacityTons'], code: 'custom', message: 'Kapasite (ton) zorunludur' });
      }
      if (data.price === undefined || Number.isNaN(data.price)) {
        ctx.addIssue({ path: ['price'], code: 'custom', message: 'Fiyat zorunludur' });
      }
    }
  });

type ListingFormData = z.infer<typeof listingSchema>;

export function PostForm() {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const createCargo = useCreateCargo();
  const createOffer = useCreateTransportOffer();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'LOAD',
      currency: 'TRY',
    },
    mode: 'onChange',
  });

  const listingType = watch('type');

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
    });

    if (selectedImages.length + validFiles.length > 6) {
      alert('En fazla 6 resim yükleyebilirsiniz');
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (data.type === 'LOAD') {
      const payload = {
        title: data.title,
        description: data.notes,
        cargoType: 'GENERAL',
        weightKg: data.capacityTons ? Math.round(data.capacityTons * 1000) : undefined,
        pickupCity: data.fromCity,
        pickupAddress: undefined,
        deliveryCity: data.toCity,
        deliveryAddress: undefined,
        pickupDate: data.pickupDate ? `${data.pickupDate}T09:00:00` : undefined,
        deliveryDate: data.deliveryDate ? `${data.deliveryDate}T18:00:00` : undefined,
        budgetMin: undefined,
        budgetMax: undefined,
      };
      createCargo.mutate(payload, {
        onSuccess: () => {
          reset();
          setSelectedImages([]);
          setImagePreviews([]);
          window.location.href = `/listings?type=LOAD`;
        },
      });
      return;
    }

    const payload = {
      fromCity: data.fromCity,
      toCity: data.toCity,
      availableDate: data.pickupDate ? `${data.pickupDate}T10:00:00` : undefined,
      availableWeightKg: data.capacityTons ? Math.round(data.capacityTons * 1000) : undefined,
      suggestedPrice: data.price,
      description: data.notes,
    };
    createOffer.mutate(payload, {
      onSuccess: () => {
        reset();
        setSelectedImages([]);
        setImagePreviews([]);
        window.location.href = `/listings?type=CAPACITY`;
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>İlan Türü</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={listingType}
            onValueChange={(value) =>
              setValue('type', value as ListingType, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="LOAD" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>{t('listing.load')}</span>
              </TabsTrigger>
              <TabsTrigger value="CAPACITY" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>{t('listing.capacity')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="LOAD" className="space-y-4">
              <p className="text-sm text-gray-600">
                Taşıyacağınız yük için nakliyeci arıyorsunuz. Yük bilgilerinizi ve taşınacağı güzergahı belirtin.
              </p>
            </TabsContent>
            
            <TabsContent value="CAPACITY" className="space-y-4">
              <p className="text-sm text-gray-600">
                Boş araç kapasitinizi paylaşıyorsunuz. Araç bilgilerinizi ve güzergahınızı belirtin.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">İlan Başlığı *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={listingType === 'LOAD' ? 'Örn: İstanbul - Ankara Tam Yük' : 'Örn: Ankara - İzmir Boş Dönüş'}
              className="mt-2"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fromCity">Nereden *</Label>
              <Select onValueChange={(value) => setValue('fromCity', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockCities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromCity && (
                <p className="text-red-600 text-sm mt-1">{errors.fromCity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="toCity">Nereye</Label>
              <Select onValueChange={(value) => setValue('toCity', value === '__ALL__' ? undefined : value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Şehir seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">Seçim yapma</SelectItem>
                  {mockCities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Tarihler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="pickupDate">
                {listingType === 'LOAD' ? 'Yükleme Tarihi' : 'Müsait Tarih'}
              </Label>
              <Input
                id="pickupDate"
                type="date"
                {...register('pickupDate')}
                onChange={(e) => setValue('pickupDate', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                className="mt-2"
              />
            </div>

            {listingType === 'LOAD' && (
              <div>
                <Label htmlFor="deliveryDate">Teslimat Tarihi</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  {...register('deliveryDate')}
                  onChange={(e) => setValue('deliveryDate', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>
              {listingType === 'LOAD' ? 'Yük Bilgileri' : 'Araç Bilgileri'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="capacityTons">
                {listingType === 'LOAD' ? 'Yük Ağırlığı (ton)' : 'Kapasite (ton)'}
              </Label>
              <Input
                id="capacityTons"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                {...register('capacityTons', { valueAsNumber: true })}
                placeholder="24"
                className="mt-2"
              />
              {errors.capacityTons && (
                <p className="text-red-600 text-sm mt-1">{errors.capacityTons.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vehicleType">Araç Türü</Label>
              <Select onValueChange={(value) => setValue('vehicleType', value as VehicleType, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Araç türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TIR">{t('vehicle.TIR')}</SelectItem>
                  <SelectItem value="Kamyon">{t('vehicle.Kamyon')}</SelectItem>
                  <SelectItem value="Kamyonet">{t('vehicle.Kamyonet')}</SelectItem>
                  <SelectItem value="Panelvan">{t('vehicle.Panelvan')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {listingType === 'CAPACITY' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Fiyat Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="price">İstenen Fiyat</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="8500"
                  className="mt-2"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  defaultValue="TRY"
                  onValueChange={(value) => setValue('currency', value as 'TRY' | 'USD' | 'EUR', { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {listingType === 'LOAD' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImagePlus className="h-5 w-5" />
              <span>Fotoğraflar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
              <ImagePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Fotoğraflarınızı buraya sürükleyin</p>
                <p className="text-sm text-gray-500">veya dosya seçmek için tıklayın</p>
                <p className="text-xs text-gray-400">En fazla 6 fotoğraf, maksimum 5MB</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Ek Notlar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">
            {listingType === 'LOAD' ? 'Yük hakkında ek bilgiler' : 'Araç ve güzergah hakkında ek bilgiler'}
          </Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder={listingType === 'LOAD' 
              ? 'Örn: Hızlı teslimat gerekli. Sigortalı yük. Forklift ile yükleme/boşaltma mümkün.'
              : 'Örn: Esnek tarih. Ara yük alınabilir. İstanbul çıkışında yükleme mümkün.'
            }
            rows={4}
            className="mt-2"
          />
          {errors.notes && (
            <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            reset();
            setSelectedImages([]);
            setImagePreviews([]);
          }}
        >
          Temizle
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={createCargo.isPending || createOffer.isPending}
        >
          {createCargo.isPending || createOffer.isPending ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 İpucu</h4>
        <p className="text-blue-800 text-sm">
          Detaylı ve net bilgi verdiğiniz ilanlar daha fazla ilgi görür. 
          Fotoğraf eklemek, ilanınızın güvenilirliğini artırır.
        </p>
      </div>
    </form>
  );
}