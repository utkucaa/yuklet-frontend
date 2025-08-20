import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListingCard } from '@/components/listings/ListingCard';
import { useFavoritesByType } from '@/hooks/useFavorites';
import { useListings } from '@/hooks/useListings';
import { useCreateConversation } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import { Heart, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


export function Favorites() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const { data: cargoFavorites } = useFavoritesByType('CARGO_REQUEST');
  const { data: transportFavorites } = useFavoritesByType('TRANSPORT_OFFER');

  const [activeTab, setActiveTab] = useState('all');

  // Get all favorite listing IDs
  const cargoFavoriteIds = cargoFavorites?.map(f => f.entityId) || [];
  const transportFavoriteIds = transportFavorites?.map(f => f.entityId) || [];

  // Fetch listings for each type
  const { data: cargoListings } = useListings({ type: 'LOAD' });
  const { data: transportListings } = useListings({ type: 'CAPACITY' });

  // Filter listings to only show favorites
  const favoriteCargoListings = cargoListings?.content?.filter((listing: any) => 
    cargoFavoriteIds.includes(listing.id)
  ) || [];
  
  const favoriteTransportListings = transportListings?.content?.filter((listing: any) => 
    transportFavoriteIds.includes(listing.id)
  ) || [];

  const allFavoriteListings = [...favoriteCargoListings, ...favoriteTransportListings];

  const handleMessage = (listing: any) => {
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    // Önce createdByProfile.id'yi dene, yoksa createdBy'yi kullan
    const targetUserId = listing?.createdByProfile?.id || listing?.createdBy;

    if (!targetUserId) {
      toast.error('İlan sahibi bilgisi bulunamadı');
      return;
    }

    if (user.id === targetUserId) {
      toast.error('Kendi ilanınıza mesaj gönderemezsiniz');
      return;
    }

    createConversation.mutate(
      { otherUserId: targetUserId },
      {
        onSuccess: () => {
          toast.success('Mesajlaşma başlatıldı');
          navigate('/messages');
        },
        onError: () => {
          toast.error('Mesajlaşma başlatılırken hata oluştu');
        },
      }
    );
  };

  const handleShare = (listing: any) => {
    // TODO: Implement share functionality
    console.log('Share listing:', listing.id);
  };



  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Container className="py-8">
          <PageHeader 
            title="Favorilerim" 
            description="Kaydettiğiniz ilanları görüntüleyin"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Tümü ({allFavoriteListings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="cargo" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Yük İlanları ({favoriteCargoListings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="transport" className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Taşıma İlanları ({favoriteTransportListings.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {allFavoriteListings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori ilanınız yok</h3>
                    <p className="text-gray-500">İlanları favorilere ekleyerek burada görüntüleyebilirsiniz</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allFavoriteListings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onMessage={handleMessage}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cargo" className="space-y-6">
              {favoriteCargoListings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori yük ilanınız yok</h3>
                    <p className="text-gray-500">Yük ilanlarını favorilere ekleyerek burada görüntüleyebilirsiniz</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCargoListings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onMessage={handleMessage}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transport" className="space-y-6">
              {favoriteTransportListings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori taşıma ilanınız yok</h3>
                    <p className="text-gray-500">Taşıma ilanlarını favorilere ekleyerek burada görüntüleyebilirsiniz</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteTransportListings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onMessage={handleMessage}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </AuthGuard>
  );
}
