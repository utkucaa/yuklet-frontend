import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/container';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: t('nav.listings'), href: '/listings' },
        { label: t('nav.post'), href: '/post' },
        { label: t('nav.pricing'), href: '/pricing' },
        { label: 'Nasıl Çalışır?', href: '/how-it-works' },
      ],
    },
    {
      title: 'Şirket',
      links: [
        { label: t('nav.about'), href: '/about' },
        { label: 'İletişim', href: '/contact' },
        { label: 'Kariyer', href: '/careers' },
        { label: 'Basın', href: '/press' },
      ],
    },
    {
      title: 'Destek',
      links: [
        { label: 'Yardım Merkezi', href: '/help' },
        { label: 'Güvenlik', href: '/security' },
        { label: 'API Dokümantasyonu', href: '/api-docs' },
        { label: 'Durum Sayfası', href: '/status' },
      ],
    },
    {
      title: 'Yasal',
      links: [
        { label: 'Kullanım Koşulları', href: '/terms' },
        { label: 'Gizlilik Politikası', href: '/privacy' },
        { label: 'Çerez Politikası', href: '/cookies' },
        { label: 'KVKK', href: '/kvkk' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 border-t">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Truck className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">yüklet</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm">
              Türkiye'nin en hızlı lojistik pazaryeri. Nakliyeciler ve yük sahipleri 
              arasında komisyonsuz bağlantı kurun.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
              </div>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-600 text-sm">
              © 2024 yüklet. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}