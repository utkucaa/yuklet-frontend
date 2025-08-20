import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingCard } from '@/components/listings/ListingCard';
import { useListings } from '@/hooks/useListings';
import { Search, Package, ArrowRight, Star, Users, MapPin, MessageSquare } from 'lucide-react';
import type { Listing } from '@/types';

export function Home() {
  const navigate = useNavigate();
  const { data: listingsResponse, isLoading } = useListings();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [type, setType] = useState<'LOAD' | 'CAPACITY'>('LOAD');

  // Extract listings from the response
  const listings = listingsResponse?.content || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Container className="py-8">
        <div className="text-center py-16 md:py-24">
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Türkiye'nin En Hızlı
              <span className="text-primary block">Lojistik Pazaryeri</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nakliyeciler ve yük sahipleri arasında komisyonsuz bağlantı kurun. 
              Hızlı, güvenli ve pratik.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Çıkış Şehri</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      value={fromCity} 
                      onChange={(e) => setFromCity(e.target.value)} 
                      placeholder="Örn. İstanbul" 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Varış Şehri</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      value={toCity} 
                      onChange={(e) => setToCity(e.target.value)} 
                      placeholder="Örn. Ankara" 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">İlan Türü</label>
                  <Select value={type} onValueChange={(v) => setType(v as 'LOAD' | 'CAPACITY')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOAD">Yük İlanı</SelectItem>
                      <SelectItem value="CAPACITY">Araç/Boş Kapasite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  size="lg"
                  className="w-full lg:w-auto px-8"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (fromCity) params.set('fromCity', fromCity);
                    if (toCity) params.set('toCity', toCity);
                    if (type) params.set('type', type);
                    navigate(`/listings?${params.toString()}`);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  İlanları İncele
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,250+</div>
              <div className="text-gray-600">Aktif İlan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">850+</div>
              <div className="text-gray-600">Üye Firma</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">81</div>
              <div className="text-gray-600">Şehir</div>
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              3 basit adımda lojistik ihtiyaçlarınızı karşılayın
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Üye Ol</h3>
                <p className="text-gray-600">Hızlıca hesap oluşturun ve profilinizi tamamlayın</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. İlan Ver veya Ara</h3>
                <p className="text-gray-600">Yük ilanı verin veya boş kapasite arayın</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Mesajlaş ve Anlaş</h3>
                <p className="text-gray-600">Gerçek zamanlı mesajlaşma ile hızlıca anlaşın</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kullanıcılarımız Ne Diyor?</h2>
            <p className="text-gray-600">Platformumuzu tercih eden firmaların deneyimleri</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Platform çok hızlı ve pratik. Dakikalar içinde iş buldum.",
                author: "Ahmet Yılmaz",
                company: "ABC Nakliyat"
              },
              {
                quote: "Güvenle iş yapıyoruz. Müşterilerimiz çok memnun.",
                author: "Fatma Demir",
                company: "Demir Lojistik"
              },
              {
                quote: "Aradığım işi hemen buldum. Çok teşekkürler!",
                author: "Mehmet Kaya",
                company: "Kaya Transport"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Öne Çıkan İlanlar</h2>
            <p className="text-gray-600">Güncel ve kaliteli ilanları keşfedin</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 6).map((listing: Listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Henüz ilan bulunmuyor</p>
                  <p className="text-sm mb-6">İlk ilanı siz oluşturun!</p>
                  <Button onClick={() => navigate('/post')}>
                    İlan Ver
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}