import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/types';
import { MapPin, Phone } from 'lucide-react';
import { api } from '@/lib/axios';

export function Profile() {
  const params = useParams();
  const id = Number(params.id);

  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      const res = await api.get(`/users/profile/${id}`);
      return res.data as UserProfile;
    },
    enabled: Number.isFinite(id) && id > 0,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Yükleniyor…</h1>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Profil bulunamadı</h1>
          <p className="text-gray-600">Kullanıcı profili mevcut değil.</p>
          <Button asChild variant="outline"><Link to="/listings">İlanlara dön</Link></Button>
        </div>
      </div>
    );
  }

  const title = profile.companyName || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Kullanıcı';
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}` || (profile.companyName?.[0] ?? 'U');
  const phone = profile.phoneNumber || profile.phone || '';

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Anasayfa</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/listings">İlanlar</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader title={title} description={profile.city || ''}>
          {profile.isVerified && <Badge className="bg-green-100 text-green-800">Doğrulanmış</Badge>}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="border-0 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={title} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-semibold">{title}</div>
                    {profile.city && (
                      <div className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.city}</div>
                    )}
                  </div>
                </div>

                {phone && (
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <a href={`tel:${phone}`}><Phone className="h-4 w-4 mr-2" /> Ara</a>
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-white border border-gray-200">
                    <div className="text-gray-500">Şehir</div>
                    <div className="text-lg font-semibold">{profile.city || '-'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-gray-200">
                    <div className="text-gray-500">Şirket</div>
                    <div className="text-lg font-semibold">{profile.companyName || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Hakkında</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="text-gray-700 whitespace-pre-wrap">{profile.about || 'Bilgi bulunamadı.'}</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}