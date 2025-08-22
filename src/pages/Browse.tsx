import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from '@/components/listings/FilterBar';
import { ListingCard } from '@/components/listings/ListingCard';
import type { SearchParams, Listing, ListingType } from '@/types';
import { useListings, useCleanupInvalidListings } from '@/hooks/useListings';
import { useCreateConversation } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  Grid3X3,
  List,
  ArrowUpDown,
  Package,
  Truck,
  Trash2,
} from 'lucide-react';

export function Browse() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchParams>({ type: (searchParams.get('type') === 'LOAD' || searchParams.get('type') === 'CAPACITY') ? (searchParams.get('type') as ListingType) : undefined });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('new');
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const cleanupListings = useCleanupInvalidListings();
  
  // Admin kontrolü - şimdilik herkese açık
  const isAdmin = true; // user?.role === 'ADMIN' || user?.email?.includes('admin');

  const handleMessage = (listing: Listing) => {
    if (!user) {
      toast.error('Mesaj göndermek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

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

  const handleShare = (listing: Listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} - Yüklet`,
        url: `${window.location.origin}/listings/${listing.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`);
      toast.success('Link kopyalandı');
    }
  };

  useEffect(() => {
    const next: SearchParams = {};
    searchParams.forEach((value, key) => {
      switch (key) {
        case 'page':
          next.page = Number(value);
          break;
        case 'size':
          next.size = Number(value);
          break;
        case 'verifiedOnly':
          next.verifiedOnly = value === 'true';
          break;
        case 'minCap':
          next.minCap = Number(value);
          break;
        case 'maxCap':
          next.maxCap = Number(value);
          break;
        case 'minPrice':
          next.minPrice = Number(value);
          break;
        case 'maxPrice':
          next.maxPrice = Number(value);
          break;
        case 'type':
          if (value === 'LOAD' || value === 'CAPACITY') next.type = value;
          break;
        case 'sort':
          if (value === 'new' || value === 'priceAsc' || value === 'priceDesc' || value === 'capDesc') {
            next.sort = value;
          }
          break;
        case 'q':
          next.q = value;
          break;

        case 'cargoType':
          if (value === 'GENERAL' || value === 'FRAGILE' || value === 'FROZEN') {
            next.cargoType = value;
          }
          break;
        case 'sortBy':
          if (value === 'createdDate' || value === 'price' || value === 'weight') {
            next.sortBy = value;
          }
          break;
        case 'sortDirection':
          if (value === 'ASC' || value === 'DESC') {
            next.sortDirection = value;
          }
          break;
        case 'fromCity':
          next.fromCity = value;
          break;
        case 'toCity':
          next.toCity = value;
          break;
        case 'dateFrom':
          next.dateFrom = value;
          break;
        case 'dateTo':
          next.dateTo = value;
          break;
        case 'vehicleType':
          next.vehicleType = value;
          break;
        case 'company':
          next.company = value;
          break;
      }
    });
    setFilters(next);
  }, [searchParams]);

  const { data: listingsData, isLoading } = useListings(filters);

  const handleFiltersChange = (newFilters: SearchParams) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    setSearchParams(params);
  };



  const activeListingType = filters.type || 'LOAD';
  const filteredListings = listingsData?.content || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isMobile={false}
            />
          </div>

          <div className="flex-1">
            <div className="lg:hidden mb-6">
              <FilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isMobile={true}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('nav.listings')}</h1>
                  <p className="text-gray-600 mt-2">
                    {listingsData?.totalElements ?? 0} ilan bulundu
                  </p>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">En Yeni</SelectItem>
                      <SelectItem value="priceAsc">Fiyat ↑</SelectItem>
                      <SelectItem value="priceDesc">Fiyat ↓</SelectItem>
                      <SelectItem value="capDesc">Kapasite ↓</SelectItem>
                    </SelectContent>
                  </Select>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cleanupListings.mutate()}
                      disabled={cleanupListings.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {cleanupListings.isPending ? 'Temizleniyor...' : 'Geçersiz İlanları Temizle'}
                    </Button>
                  )}
                </div>
              </div>

              <Tabs
                value={activeListingType}
                onValueChange={(value) => handleFiltersChange({ ...filters, type: value as ListingType })}
              >
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="LOAD" className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>{t('listing.loads')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="CAPACITY" className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>{t('listing.capacities')}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="LOAD" className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Yük İlanları
                    </h2>
                    <p className="text-gray-600">
                      Taşıyacak yükü olan firma ve kişiler tarafından verilen ilanlar
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="CAPACITY" className="mt-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Araç/Boş Kapasite İlanları
                    </h2>
                    <p className="text-gray-600">
                      Boş araç kapasitesi olan nakliyeciler tarafından verilen ilanlar
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-3/4 h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                                      <ListingCard
                      key={listing.id}
                      listing={listing}
                      onMessage={handleMessage}
                      onShare={handleShare}
                    />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t('common.noResults')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Aradığınız kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyin.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFiltersChange({})}
                    >
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {listingsData && listingsData.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                {Array.from({ length: listingsData.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={i === (filters.page || 0) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFiltersChange({ ...filters, page: i })}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}