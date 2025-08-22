import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCleanupInvalidListings, useApproveListing, useRejectListing, useDeleteListing, usePendingListings, useAdminAllListings, useUpdateListingStatus } from '@/hooks/useListings';
import { useAllUsers, usePendingUsers, useApproveUser, useRejectUser, useSuspendUser, useActivateUser, useDeleteUser } from '@/hooks/useProfile';
import { useAdminDashboardStats, useAdminSystemHealth } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  Trash2, 
  AlertTriangle, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  Search,
  Eye,
  Ban,
  Check,
  X,
  Shield,
  Activity
} from 'lucide-react';

export function Admin() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Admin kontrolü - sadece admin@yuklet.com kullanıcısı erişebilir
  if (!user || user.email !== 'admin@yuklet.com') {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Erişim Reddedildi</CardTitle>
              <CardDescription className="text-center">
                Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece admin kullanıcıları bu sayfaya erişebilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.history.back()} className="w-full">
                Geri Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }
  const cleanupListings = useCleanupInvalidListings();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedListing, setSelectedListing] = useState<{ id: number; type: 'LOAD' | 'CAPACITY' } | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Listing hooks
  const approveListing = useApproveListing();
  const rejectListing = useRejectListing();
  const deleteListing = useDeleteListing();
  const updateListingStatus = useUpdateListingStatus();
  const { data: pendingListings, isLoading: listingsLoading } = usePendingListings();
  const { data: adminAllListings, isLoading: adminListingsLoading } = useAdminAllListings();

  // User hooks
  const { data: allUsers, isLoading: usersLoading } = useAllUsers();
  const { data: pendingUsers, isLoading: pendingUsersLoading } = usePendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();
  const deleteUser = useDeleteUser();

  // Admin stats hooks
  const { data: dashboardStats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: systemHealth, isLoading: healthLoading } = useAdminSystemHealth();

  // Mock data - gerçek API verisi yoksa fallback
  const mockStats = dashboardStats || {
    totalUsers: 1247,
    activeUsers: 892,
    totalListings: 3456,
    activeListings: 2891,
    totalCargo: 2156,
    totalCapacity: 1300,
    monthlyRevenue: 45600,
    verifiedUsers: 678
  };

  // Gerçek API verileri veya fallback mock data
  const users = allUsers || [
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'USER', status: 'ACTIVE', verified: true, joinDate: '2024-01-15', listings: 12 },
    { id: 2, name: 'Mehmet Demir', email: 'mehmet@example.com', role: 'CARRIER', status: 'ACTIVE', verified: true, joinDate: '2024-02-20', listings: 8 },
    { id: 3, name: 'Fatma Kaya', email: 'fatma@example.com', role: 'USER', status: 'SUSPENDED', verified: false, joinDate: '2024-03-10', listings: 3 },
    { id: 4, name: 'Ali Özkan', email: 'ali@example.com', role: 'ADMIN', status: 'ACTIVE', verified: true, joinDate: '2023-12-01', listings: 0 },
  ];

  // Bekleyen ilanlar (onay bekleyen)
  const pendingListingsData = pendingListings?.content || [
    { id: 1, title: 'İstanbul-Ankara Yük Taşıma', type: 'LOAD', status: 'PENDING', user: 'Ahmet Yılmaz', createdAt: '2024-03-15', price: 2500, fromCity: 'İstanbul', toCity: 'Ankara' },
    { id: 2, title: 'Boş Kapasite İzmir-İstanbul', type: 'CAPACITY', status: 'PENDING', user: 'Mehmet Demir', createdAt: '2024-03-14', price: 1800, fromCity: 'İzmir', toCity: 'İstanbul' },
    { id: 3, title: 'Antalya-Bursa Yük', type: 'LOAD', status: 'PENDING', user: 'Fatma Kaya', createdAt: '2024-03-13', price: 3200, fromCity: 'Antalya', toCity: 'Bursa' },
    { id: 4, title: 'Boş Kapasite Ankara-Konya', type: 'CAPACITY', status: 'PENDING', user: 'Mehmet Demir', createdAt: '2024-03-12', price: 1200, fromCity: 'Ankara', toCity: 'Konya' },
  ];

  // Tüm ilanlar (admin için)
  const allListingsData = adminAllListings?.content || pendingListingsData;

  const handleCleanup = () => {
    if (showConfirmation) {
      cleanupListings.mutate();
      setShowConfirmation(false);
    } else {
      setShowConfirmation(true);
    }
  };

  // İlan onay işlemleri
  const handleApproveListing = (id: number, type: 'LOAD' | 'CAPACITY') => {
    approveListing.mutate({ id, type });
  };

  const handleRejectListing = (id: number, type: 'LOAD' | 'CAPACITY') => {
    if (rejectReason.trim()) {
      rejectListing.mutate({ id, type, reason: rejectReason });
      setRejectReason('');
      setSelectedListing(null);
    }
  };

  const handleDeleteListing = (id: number, type: 'LOAD' | 'CAPACITY') => {
    if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      deleteListing.mutate({ id, type });
    }
  };

  const handleUpdateListingStatus = (id: number, type: 'LOAD' | 'CAPACITY', status: string) => {
    updateListingStatus.mutate({ id, type, status });
  };

  // Kullanıcı onay işlemleri
  const handleApproveUser = (userId: number) => {
    approveUser.mutate(userId);
  };

  const handleRejectUser = (userId: number) => {
    if (rejectReason.trim()) {
      rejectUser.mutate({ userId, reason: rejectReason });
      setRejectReason('');
      setSelectedUser(null);
    }
  };

  const handleSuspendUser = (userId: number) => {
    const reason = prompt('Askıya alma sebebi:');
    if (reason !== null) {
      suspendUser.mutate({ userId, reason });
    }
  };

  const handleActivateUser = (userId: number) => {
    activateUser.mutate(userId);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      deleteUser.mutate(userId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'CARRIER': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
                  <p className="text-gray-600 mt-2">
                    Sistem yönetimi ve kullanıcı/ilan yönetimi
                  </p>
                </div>
                                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {systemHealth?.status || 'Sistem Aktif'}
                    </Badge>
                    <Badge variant="outline">
                      {user?.email}
                    </Badge>
                  </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {statsLoading ? (
                // Loading skeleton
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockStats.totalUsers?.toLocaleString() || '0'}</div>
                      <p className="text-xs text-muted-foreground">
                        +{mockStats.activeUsers || 0} aktif kullanıcı
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockStats.totalListings?.toLocaleString() || '0'}</div>
                      <p className="text-xs text-muted-foreground">
                        {mockStats.activeListings || 0} aktif ilan
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Kullanıcılar
                </TabsTrigger>
                <TabsTrigger value="listings" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  İlanlar
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Sistem
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Son Aktiviteler</CardTitle>
                      <CardDescription>Son 24 saatteki sistem aktiviteleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Yeni kullanıcı kaydı</p>
                            <p className="text-xs text-gray-500">2 dakika önce</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Yeni yük ilanı eklendi</p>
                            <p className="text-xs text-gray-500">15 dakika önce</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Kullanıcı doğrulaması bekliyor</p>
                            <p className="text-xs text-gray-500">1 saat önce</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>


                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Kullanıcı Yönetimi</CardTitle>
                        <CardDescription>Kullanıcıları görüntüle, düzenle ve yönet</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Kullanıcı ara..." className="w-64" />
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      {usersLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Kullanıcı</th>
                            <th className="text-left p-2">Rol</th>
                            <th className="text-left p-2">Durum</th>
                            <th className="text-left p-2">Doğrulama</th>
                            <th className="text-left p-2">İlan Sayısı</th>
                            <th className="text-left p-2">Kayıt Tarihi</th>
                            <th className="text-left p-2">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </td>
                              <td className="p-2">
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-2">
                                {user.verified ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                              </td>
                              <td className="p-2">{user.listings}</td>
                              <td className="p-2 text-sm text-gray-500">{user.joinDate}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {user.status === 'PENDING' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleApproveUser(user.id)}
                                        disabled={approveUser.isPending}
                                      >
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedUser(user.id)}
                                      >
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                  {user.status === 'ACTIVE' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleSuspendUser(user.id)}
                                      disabled={suspendUser.isPending}
                                    >
                                      <Ban className="h-4 w-4 text-yellow-600" />
                                    </Button>
                                  )}
                                  {user.status === 'SUSPENDED' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleActivateUser(user.id)}
                                      disabled={activateUser.isPending}
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={deleteUser.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reddetme Modal */}
                {selectedUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kullanıcı Reddetme</CardTitle>
                      <CardDescription>Reddetme sebebini belirtin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="reject-reason">Sebep</Label>
                        <Input
                          id="reject-reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reddetme sebebini yazın..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectUser(selectedUser)}
                          disabled={!rejectReason.trim() || rejectUser.isPending}
                          variant="destructive"
                        >
                          {rejectUser.isPending ? 'Reddediliyor...' : 'Reddet'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(null);
                            setRejectReason('');
                          }}
                        >
                          İptal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Listings Tab */}
              <TabsContent value="listings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>İlan Yönetimi</CardTitle>
                        <CardDescription>Tüm ilanları görüntüle, onayla, reddet ve yönet</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Durum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            <SelectItem value="pending">Bekleyen</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="completed">Tamamlanan</SelectItem>
                            <SelectItem value="cancelled">İptal</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Tür" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            <SelectItem value="load">Yük</SelectItem>
                            <SelectItem value="capacity">Kapasite</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="İlan ara..." className="w-64" />
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      {listingsLoading || adminListingsLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">İlan</th>
                            <th className="text-left p-2">Tür</th>
                            <th className="text-left p-2">Durum</th>
                            <th className="text-left p-2">Kullanıcı</th>
                            <th className="text-left p-2">Rota</th>
                            <th className="text-left p-2">Fiyat</th>
                            <th className="text-left p-2">Tarih</th>
                            <th className="text-left p-2">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allListingsData.map((listing) => (
                            <tr key={listing.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                <p className="font-medium">{listing.title}</p>
                              </td>
                              <td className="p-2">
                                <Badge variant={listing.type === 'LOAD' ? 'default' : 'secondary'}>
                                  {listing.type === 'LOAD' ? 'Yük' : 'Kapasite'}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge className={getStatusColor(listing.status)}>
                                  {listing.status}
                                </Badge>
                              </td>
                              <td className="p-2">{listing.user}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1 text-sm">
                                  {listing.fromCity} → {listing.toCity}
                                </div>
                              </td>
                              <td className="p-2">₺{listing.price}</td>
                              <td className="p-2 text-sm text-gray-500">{listing.createdAt}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* PENDING durumu için onay/red butonları */}
                                  {listing.status === 'PENDING' && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleApproveListing(listing.id, listing.type)}
                                        disabled={approveListing.isPending}
                                        title="Onayla"
                                      >
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedListing({ id: listing.id, type: listing.type })}
                                        title="Reddet"
                                      >
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}

                                  {/* ACTIVE durumu için iptal butonu */}
                                  {listing.status === 'ACTIVE' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleUpdateListingStatus(listing.id, listing.type, 'CANCELLED')}
                                      disabled={updateListingStatus.isPending}
                                      title="İptal Et"
                                    >
                                      <Ban className="h-4 w-4 text-yellow-600" />
                                    </Button>
                                  )}

                                  {/* CANCELLED durumu için aktifleştirme butonu */}
                                  {listing.status === 'CANCELLED' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleUpdateListingStatus(listing.id, listing.type, 'ACTIVE')}
                                      disabled={updateListingStatus.isPending}
                                      title="Aktifleştir"
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                  )}

                                  {/* Tamamlama butonu */}
                                  {listing.status === 'ACTIVE' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleUpdateListingStatus(listing.id, listing.type, 'COMPLETED')}
                                      disabled={updateListingStatus.isPending}
                                      title="Tamamla"
                                    >
                                      <Check className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  )}

                                  {/* Silme butonu */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteListing(listing.id, listing.type)}
                                    disabled={deleteListing.isPending}
                                    title="Sil"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* İlan Reddetme Modal */}
                {selectedListing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>İlan Reddetme</CardTitle>
                      <CardDescription>Reddetme sebebini belirtin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="listing-reject-reason">Sebep</Label>
                        <Input
                          id="listing-reject-reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reddetme sebebini yazın..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectListing(selectedListing.id, selectedListing.type)}
                          disabled={!rejectReason.trim() || rejectListing.isPending}
                          variant="destructive"
                        >
                          {rejectListing.isPending ? 'Reddediliyor...' : 'Reddet'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedListing(null);
                            setRejectReason('');
                          }}
                        >
                          İptal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Database Cleanup */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-600" />
                        Veritabanı Temizleme
                      </CardTitle>
                      <CardDescription>
                        Veritabanında bulunmayan geçersiz ilanları tespit edip siler
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Bu işlem geri alınamaz. Sadece veritabanında gerçekten bulunmayan ilanlar silinecektir.
                        </AlertDescription>
                      </Alert>

                      {cleanupListings.isSuccess && (
                        <Alert>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-600">
                            Temizleme işlemi başarıyla tamamlandı!
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-4">
                        {!showConfirmation ? (
                          <Button
                            onClick={handleCleanup}
                            disabled={cleanupListings.isPending}
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            {cleanupListings.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Temizleniyor...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Geçersiz İlanları Temizle
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="flex gap-4">
                            <Button
                              onClick={handleCleanup}
                              disabled={cleanupListings.isPending}
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              {cleanupListings.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Temizleniyor...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Evet, Temizle
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => setShowConfirmation(false)}
                              variant="outline"
                              disabled={cleanupListings.isPending}
                            >
                              İptal
                            </Button>
                          </div>
                        )}
                      </div>

                      {cleanupListings.isError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Temizleme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* System Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sistem Durumu</CardTitle>
                      <CardDescription>Mevcut sistem bilgileri ve ayarları</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">API Durumu</h3>
                    <p className="text-sm text-gray-600">{systemHealth?.status || 'Aktif'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Uptime</h3>
                    <p className="text-sm text-gray-600">{systemHealth?.uptime ? `${Math.round(systemHealth.uptime / 3600)} saat` : 'Bilinmiyor'}</p>
                  </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>API Base URL</Label>
                          <Input 
                            value={import.meta.env.VITE_API_URL || 'http://localhost:8080/api'} 
                            readOnly 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Auth Token</Label>
                          <Input 
                            value={localStorage.getItem('auth-token') ? 'Mevcut' : 'Yok'} 
                            readOnly 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}
