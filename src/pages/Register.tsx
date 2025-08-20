import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Truck, Package, Eye, EyeOff, Building, Phone, MapPin } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string(),
  userType: z.enum(['SHIPPER', 'CARRIER']),
  phone: z.string().min(7, 'Telefon numarası geçersiz').optional(),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır').optional(),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').optional(),
  companyName: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır').optional(),
  city: z.string().min(2, 'Şehir adı en az 2 karakter olmalıdır').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterPayload {
  email: string;
  password: string;
  userType: 'SHIPPER' | 'CARRIER';
  phone?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  city?: string;
}

export function Register() {
  const { t } = useTranslation();
  const { register: registerUser, isRegistering } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'SHIPPER',
    },
  });

  const selectedRole = watch('userType');

  const onSubmit = (data: RegisterFormData) => {
    const payload: RegisterPayload = {
      email: data.email,
      password: data.password,
      userType: data.userType,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      city: data.city,
    };
    registerUser(payload, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <Container size="sm">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <Truck className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-gray-900">yüklet</span>
            </Link>
          </div>

          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center space-y-2 pb-8">
              <CardTitle className="text-2xl font-bold">{t('auth.register.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                Hesabınızı oluşturun ve başlayın
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>{t('auth.registerAs')}</Label>
                  <Tabs
                    value={selectedRole}
                    onValueChange={(value) => setValue('userType', value as 'SHIPPER' | 'CARRIER')}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="SHIPPER" className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{t('auth.shipper')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="CARRIER" className="flex items-center space-x-2">
                        <Truck className="h-4 w-4" />
                        <span>{t('auth.carrier')}</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="SHIPPER" className="mt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900">Yük Sahibi</h4>
                            <p className="text-blue-800 text-sm mt-1">
                              Taşıyacak yükünüz var ve nakliyeci arıyorsunuz.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="CARRIER" className="mt-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-900">Nakliyeci</h4>
                            <p className="text-green-800 text-sm mt-1">
                              Nakliye hizmeti veriyorsunuz ve yük arıyorsunuz.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Adınız"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Soyadınız"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Şirket Adı</span>
                    </div>
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={selectedRole === 'CARRIER' ? 'Nakliyat şirketinizin adı' : 'Şirketinizin adı'}
                    {...register('companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-red-600 text-sm">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Telefon</span>
                    </div>
                  </Label>
                  <Input id="phone" type="tel" placeholder="+90 5xx xxx xx xx" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-red-600 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Şehir</span>
                    </div>
                  </Label>
                  <Input id="city" type="text" placeholder="Istanbul" {...register('city')} />
                  {errors.city && (
                    <p className="text-red-600 text-sm">{errors.city.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')} *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={errors.password ? 'border-red-300 focus:border-red-500 pr-12' : 'pr-12'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')} *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-red-300 focus:border-red-500 pr-12' : 'pr-12'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Kayıt oluşturuluyor...' : t('auth.register.title')}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  {t('auth.hasAccount')}{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {t('nav.login')}
                  </Link>
                </div>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Kayıt olarak{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Kullanım Koşulları
                  </Link>
                  {' '}ve{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Gizlilik Politikası
                  </Link>
                  'nı kabul etmiş olursunuz.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}