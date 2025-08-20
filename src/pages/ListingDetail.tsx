import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { ListingCard } from '@/components/listings/ListingCard';
import { useListing } from '@/hooks/useListings';
import { useCreateConversation } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import type { Listing } from '@/types';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Package, Truck, ArrowLeft, Share, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

export function ListingDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { user } = useAuthStore();
  const createConversation = useCreateConversation();
  const { data: listing } = useListing(id);

  const handleSendMessage = () => {
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    console.log('=== LISTING DETAIL DEBUG ===');
    console.log('Full listing data:', listing);
    console.log('createdBy:', listing?.createdBy);
    console.log('createdByProfile:', listing?.createdByProfile);
    console.log('createdByProfile.id:', listing?.createdByProfile?.id);
    console.log('User ID:', user?.id);
    console.log('==========================');

    const targetUserId = listing?.createdByProfile?.id || listing?.createdBy;

    if (!targetUserId) {
      toast.error('İlan sahibi bilgisi bulunamadı');
      return;
    }

    if (user.id === targetUserId) {
      toast.error('Kendi ilanınıza mesaj gönderemezsiniz');
      return;
    }

    toast.loading('Mesajlaşma başlatılıyor...', { id: 'create-conversation' });

    createConversation.mutate(
      { otherUserId: targetUserId },
      {
        onSuccess: (conversation) => {
          toast.success('Mesajlaşma başlatıldı!', { id: 'create-conversation' });
          navigate(`/messages?conversation=${conversation.id}`);
        },
        onError: (error) => {
          console.error('Conversation creation error:', error);
          toast.error('Mesajlaşma başlatılırken hata oluştu. Lütfen tekrar deneyin.', { 
            id: 'create-conversation',
            duration: 5000 
          });
        },
      }
    );
  };

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">İlan bulunamadı</h1>
          <p className="text-gray-600">Aradığınız ilan silinmiş veya hiç var olmamış olabilir.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Geri dön
            </Button>
            <Button asChild>
              <Link to="/listings">İlanlara dön</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const typeColor = listing.type === 'LOAD' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  const createdAgo = formatDistance(new Date(listing.createdAt), new Date(), { addSuffix: true, locale: tr });
  const related: Listing[] = [];
  const formatPrice = (price?: number, currency?: string) => (price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY', minimumFractionDigits: 0 }).format(price) : null);

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Anasayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/listings">İlanlar</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{listing.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageHeader
          title={listing.title}
          description={`${listing.fromCity}${listing.toCity ? ' → ' + listing.toCity : ''} • ${createdAgo}`}
        >
          <div className="flex items-center gap-2">
            <Badge className={typeColor}>{listing.type === 'LOAD' ? 'Yük İlanı' : 'Araç/Boş Kapasite'}</Badge>
            {listing.isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {(listing.images && listing.images.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <img src={listing.images[0]} alt={listing.title} className="w-full h-64 object-cover rounded-2xl" />
                <div className="grid grid-rows-2 gap-4">
                  <img src={listing.images[1] || listing.images[0]} alt="detail" className="w-full h-30 object-cover rounded-xl" />
                  <img src={listing.images[2] || listing.images[0]} alt="detail" className="w-full h-30 object-cover rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="h-64 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500">Görsel bulunmuyor</div>
            )}

            <Card className="border-0 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{listing.fromCity}</span>
                    {listing.toCity && (
                      <>
                        <span className="opacity-60">→</span>
                        <span className="font-medium">{listing.toCity}</span>
                      </>
                    )}
                  </div>
                  {listing.pickupDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(listing.pickupDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  {listing.capacityTons && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{listing.capacityTons} ton</span>
                    </div>
                  )}
                  {listing.vehicleType && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>{listing.vehicleType}</span>
                    </div>
                  )}
                </div>

                {listing.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notlar</h3>
                    <p className="text-gray-700 leading-relaxed">{listing.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {related.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Benzer İlanlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-0 rounded-2xl shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-6">
                {listing.type === 'CAPACITY' && typeof listing.price === 'number' && (
                  <div>
                    <div className="text-sm text-gray-500">Fiyat</div>
                    <div className="text-2xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-sm text-gray-500 font-medium">İlan Sahibi</div>
                  {listing.createdByProfile ? (
                    <Link to={`/profiles/${listing.createdByProfile.id}`} className="flex items-center gap-3 group p-3 rounded-lg border border-gray-200 hover:border-primary/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={listing.createdByProfile.companyName} />
                        <AvatarFallback className="text-sm font-medium">
                          {listing.createdByProfile.companyName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                          {listing.createdByProfile.companyName || 'İsimsiz Şirket'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.createdByProfile.city || 'Şehir belirtilmemiş'}
                        </div>
                        {listing.createdByProfile.isVerified && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Doğrulanmış</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm font-medium">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          Kullanıcı #{listing.createdBy}
                        </div>
                        <div className="text-sm text-gray-500">
                          Profil bilgisi mevcut değil
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={createConversation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {createConversation.isPending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                  <Button variant="outline" className="flex-1"><Share className="h-4 w-4 mr-2" /> Paylaş</Button>
                  <Button variant="outline"><Heart className="h-4 w-4" /></Button>
                </div>
                <Button variant="ghost" asChild>
                  <Link to="/listings">← Tüm ilanlara dön</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}


