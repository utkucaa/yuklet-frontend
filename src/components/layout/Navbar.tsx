import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import {
  Menu,
  User,
  LogOut,
  
  Plus,
  Truck,
  Globe,
  Package,
  MessageSquare,
  Bell,
} from 'lucide-react';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const [isScrolled] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const navLinks = [
    { href: '/listings', label: t('nav.listings'), icon: Package },
    { href: '/about', label: t('nav.about'), icon: null },
  ];

  const MobileNav = () => (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">yüklet</span>
          </Link>
          
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

          </div>

          {isAuthenticated ? (
            <div className="space-y-2 pt-4 border-t">
              <Link
                to="/post"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Plus className="h-5 w-5" />
                <span>{t('nav.post')}</span>
              </Link>
              <Link
                to={user ? `/profiles/${user.id}` : '/login'}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>{t('nav.profile')}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-4 border-t">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">yüklet</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>
                  Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <>
                <Button asChild className="hidden md:flex">
                  <Link to="/post">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('nav.post')}
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.email} />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate(user ? `/profiles/${user.id}` : '/login')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            )}

            <MobileNav />
          </div>
        </div>
      </Container>
    </nav>
  );
}