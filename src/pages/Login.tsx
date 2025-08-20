import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { Truck, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { t } = useTranslation();
  const { login, isLoggingIn, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <Container size="sm">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <Truck className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-gray-900">yüklet</span>
            </Link>
          </div>

          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center space-y-2 pb-8">
              <CardTitle className="text-2xl font-bold">{t('auth.login.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                Hesabınıza giriş yapın
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      {t('auth.rememberMe')}
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Giriş yapılıyor...' : t('auth.login.title')}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  {t('auth.noAccount')}{' '}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
                  
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">🔑 Demo Giriş</h4>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => { loginDemo('CARRIER'); navigate('/profiles/2'); }}>
                Nakliyeci olarak gir
              </Button>
              <Button type="button" variant="outline" onClick={() => { loginDemo('SHIPPER'); navigate('/'); }}>
                Yük sahibi olarak gir
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}