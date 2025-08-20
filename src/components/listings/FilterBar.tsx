import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import type { SearchParams, ListingType } from '@/types';
import { mockCities } from '@/data/mockData';
import {
  Filter,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  Truck,
  Package,
  DollarSign,
  Building,
  CheckCircle,
  SortAsc,
} from 'lucide-react';

interface FilterBarProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
  isMobile?: boolean;
}

export function FilterBar({ filters, onFiltersChange, isMobile = false }: FilterBarProps) {
  const { t } = useTranslation();
  const [activeFilters, setActiveFilters] = useState<(keyof SearchParams)[]>([]);

  const updateFilter = <K extends keyof SearchParams>(
    key: K,
    value: SearchParams[K] | '__ALL__' | '' | null | undefined
  ) => {
    const shouldClear = value === undefined || value === null || value === '' || value === '__ALL__';
    const newFilters: SearchParams = { ...filters };
    if (shouldClear) {
      delete newFilters[key];
    } else {
      newFilters[key] = value as SearchParams[K];
    }
    onFiltersChange(newFilters);
    
    const filterKeys = Object.keys(newFilters).filter(k => k !== 'page' && k !== 'size');
    setActiveFilters(filterKeys as (keyof SearchParams)[]);
  };

  const clearFilters = () => {
    onFiltersChange({});
    setActiveFilters([]);
  };

  const getFilterLabel = (key: keyof SearchParams, value: SearchParams[keyof SearchParams]) => {
    switch (key) {
      case 'type':
        return value === 'LOAD' ? t('listing.load') : t('listing.capacity');
      case 'fromCity':
        return `Nereden: ${value as string}`;
      case 'toCity':
        return `Nereye: ${value as string}`;
      case 'vehicleType':
        return t(`vehicle.${String(value)}`);
      case 'verifiedOnly':
        return 'Onaylı İlanlar';
      case 'cargoType':
        return `Kargo Tipi: ${value as string}`;
      case 'sortBy':
        return `Sıralama: ${value as string}`;
      case 'sortDirection':
        return `Yön: ${value as string}`;
      default:
        return `${String(key)}: ${String(value)}`;
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">


      <div className="space-y-3">
        <Label className="text-sm font-medium">İlan Türü</Label>
        <Select value={filters.type || ''} onValueChange={(value: ListingType | '__ALL__' | '') => updateFilter('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tüm İlanlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">{t('common.all')}</SelectItem>
            <SelectItem value="LOAD">{t('listing.load')}</SelectItem>
            <SelectItem value="CAPACITY">{t('listing.capacity')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <Label className="text-sm font-medium">Güzergah</Label>
          </div>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-gray-500">Nereden</Label>
            <Select
              value={filters.fromCity || ''}
              onValueChange={(value) => updateFilter('fromCity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Tüm Şehirler</SelectItem>
                {mockCities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Nereye</Label>
            <Select
              value={filters.toCity || ''}
              onValueChange={(value) => updateFilter('toCity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">Tüm Şehirler</SelectItem>
                {mockCities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <Label className="text-sm font-medium">Tarih Aralığı</Label>
          </div>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-gray-500">Başlangıç</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Bitiş</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4" />
          <Label className="text-sm font-medium">Araç Türü</Label>
        </div>
        <Select
          value={filters.vehicleType || ''}
          onValueChange={(value) => updateFilter('vehicleType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tüm Araçlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Tüm Araçlar</SelectItem>
            <SelectItem value="TIR">{t('vehicle.TIR')}</SelectItem>
            <SelectItem value="Kamyon">{t('vehicle.Kamyon')}</SelectItem>
            <SelectItem value="Kamyonet">{t('vehicle.Kamyonet')}</SelectItem>
            <SelectItem value="Panelvan">{t('vehicle.Panelvan')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <Label className="text-sm font-medium">Kapasite (ton)</Label>
          </div>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minCap || ''}
                onChange={(e) => updateFilter('minCap', Number(e.target.value) || undefined)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Max</Label>
              <Input
                type="number"
                placeholder="100"
                value={filters.maxCap || ''}
                onChange={(e) => updateFilter('maxCap', Number(e.target.value) || undefined)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <Label className="text-sm font-medium">Fiyat Aralığı (TL)</Label>
          </div>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Min</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', Number(e.target.value) || undefined)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Max</Label>
              <Input
                type="number"
                placeholder="50000"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || undefined)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <Label className="text-sm font-medium">Şirket</Label>
        </div>
        <Input
          placeholder="Şirket adı ara..."
          value={filters.company || ''}
          onChange={(e) => updateFilter('company', e.target.value)}
        />
      </div>

      {/* Cargo Type (for LOAD listings) */}
      {filters.type === 'LOAD' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Kargo Tipi</Label>
          <Select value={filters.cargoType || ''} onValueChange={(value: 'GENERAL' | 'FRAGILE' | 'FROZEN' | '') => updateFilter('cargoType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tüm Kargo Tipleri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm Kargo Tipleri</SelectItem>
              <SelectItem value="GENERAL">Genel Kargo</SelectItem>
              <SelectItem value="FRAGILE">Kırılabilir</SelectItem>
              <SelectItem value="FROZEN">Dondurulmuş</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sorting */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4" />
            <Label className="text-sm font-medium">Sıralama</Label>
          </div>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-gray-500">Sıralama Alanı</Label>
            <Select value={filters.sortBy || ''} onValueChange={(value: 'createdDate' | 'price' | 'weight' | '') => updateFilter('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Oluşturulma Tarihi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdDate">Oluşturulma Tarihi</SelectItem>
                <SelectItem value="price">Fiyat</SelectItem>
                <SelectItem value="weight">Ağırlık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Sıralama Yönü</Label>
            <Select value={filters.sortDirection || ''} onValueChange={(value: 'ASC' | 'DESC' | '') => updateFilter('sortDirection', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Azalan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Azalan (Yeni → Eski)</SelectItem>
                <SelectItem value="ASC">Artarak (Eski → Yeni)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={filters.verifiedOnly || false}
          onCheckedChange={(checked) => updateFilter('verifiedOnly', checked === 'indeterminate' ? false : !!checked)}
        />
        <Label htmlFor="verified" className="text-sm font-medium flex items-center space-x-1">
          <CheckCircle className="h-4 w-4" />
          <span>Sadece Onaylı İlanlar</span>
        </Label>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          {t('common.clear')} ({activeFilters.length})
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {t('common.filter')}
                {activeFilters.length > 0 && (
                  <Badge className="ml-2 bg-primary text-white">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtrele</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
                
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((key) => {
              const value = filters[key];
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => updateFilter(key, undefined)}
                >
                  {getFilterLabel(key, value)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Filtrele</h3>
        {activeFilters.length > 0 && (
          <Badge variant="secondary">{activeFilters.length}</Badge>
        )}
      </div>
      <FilterContent />
    </div>
  );
}