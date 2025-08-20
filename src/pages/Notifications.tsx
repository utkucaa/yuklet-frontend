import { AuthGuard } from '@/components/auth/AuthGuard';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Check, CheckCheck } from 'lucide-react';

export function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'ERROR':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'border-green-200 bg-green-50';
      case 'WARNING':
        return 'border-yellow-200 bg-yellow-50';
      case 'ERROR':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen">
          <Container className="py-8">
            <PageHeader title="Bildirimler" description="Tüm bildirimlerinizi görüntüleyin" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Container className="py-8">
          <PageHeader 
            title="Bildirimler" 
            description="Tüm bildirimlerinizi görüntüleyin"
          />
          
          <div className="flex justify-end mb-6">
            <Button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Tümünü Okundu İşaretle
            </Button>
          </div>

          <div className="space-y-4">
            {notifications?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bildiriminiz yok</h3>
                  <p className="text-gray-500">Yeni bildirimler geldiğinde burada görünecek</p>
                </CardContent>
              </Card>
            ) : (
              notifications?.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-colors ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="text-xs">
                                Yeni
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistance(new Date(notification.createdAt), new Date(), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </p>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead.mutate(notification.id)}
                          disabled={markRead.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}
