import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Listing, EntityType } from '@/types';
import { useCheckFavorite, useAddFavorite, useRemoveFavorite } from '@/hooks/useFavorites';
import {
  MapPin,
  Calendar,
  Truck,
  Package,
  MessageCircle,
  Share,
  Heart,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ListingCardProps {
  listing: Listing;
  onMessage?: (listing: Listing) => void;
  onShare?: (listing: Listing) => void;
}

export function ListingCard({ listing, onMessage, onShare }: ListingCardProps) {
  const { t } = useTranslation();
  const entityType: EntityType = listing.type === 'LOAD' ? 'CARGO_REQUEST' : 'TRANSPORT_OFFER';
  const { data: isFavorite } = useCheckFavorite(listing.id, entityType);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleSave = (listing: Listing) => {
    if (isFavorite) {
      removeFavorite.mutate({ entityId: listing.id, entityType });
    } else {
      addFavorite.mutate({ entityId: listing.id, entityType });
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'TIR':
      case 'Kamyon':
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'LOAD' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(listing.type)}>
                {t(listing.type === 'LOAD' ? 'listing.load' : 'listing.capacity')}
              </Badge>
              {listing.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {formatDistance(new Date(listing.createdAt), new Date(), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
            </div>
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.id}`}>
            <h3 className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors line-clamp-2">
              {listing.title}
            </h3>
          </Link>

          {/* Route */}
          <div className="flex items-center space-x-2 mt-3 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{listing.fromCity}</span>
            {listing.toCity && (
              <>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{listing.toCity}</span>
              </>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {listing.pickupDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(listing.pickupDate).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
            {listing.vehicleType && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getVehicleIcon(listing.vehicleType)}
                <span>{t(`vehicle.${listing.vehicleType}`)}</span>
              </div>
            )}
            {listing.capacityTons && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{listing.capacityTons} ton</span>
              </div>
            )}
            {listing.type === 'CAPACITY' && listing.price && (
              <div className="text-lg font-semibold text-primary">
                {formatPrice(listing.price, listing.currency)}
              </div>
            )}
          </div>

          {/* Company */}
          {listing.createdByProfile && (
            <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={listing.createdByProfile.companyName} />
                <AvatarFallback>
                  {listing.createdByProfile.companyName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">
                  {listing.createdByProfile.companyName || 'İsimsiz Şirket'}
                </div>
                <div className="text-xs text-gray-500">
                  {listing.createdByProfile.city}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave(listing)}
                className={`${isFavorite ? 'text-red-500' : 'text-gray-600'} hover:text-primary`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(listing)}
                className="text-gray-600 hover:text-primary"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => onMessage?.(listing)}
              className="bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mesaj Gönder
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}