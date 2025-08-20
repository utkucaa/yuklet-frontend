import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      // Navigation
      "nav.listings": "İlanlar",
      "nav.post": "İlan Ver",
      "nav.pricing": "Fiyatlandırma",
      "nav.about": "Hakkında",
      "nav.login": "Giriş",
      "nav.register": "Kayıt Ol",
      "nav.profile": "Profil",
      "nav.logout": "Çıkış",
      
      // Common
      "common.search": "Ara",
      "common.filter": "Filtrele",
      "common.sort": "Sırala",
      "common.clear": "Temizle",
      "common.save": "Kaydet",
      "common.cancel": "İptal",
      "common.delete": "Sil",
      "common.edit": "Düzenle",
      "common.contact": "İletişim",
      "common.share": "Paylaş",
      "common.loading": "Yükleniyor...",
      "common.noResults": "Sonuç bulunamadı",
      
      // Listing types
      "listing.load": "Yük İlanı",
      "listing.capacity": "Boş Kapasite",
      "listing.loads": "Yük İlanları",
      "listing.capacities": "Araç/Boş Kapasite",
      
      // Vehicle types
      "vehicle.TIR": "TIR",
      "vehicle.Kamyon": "Kamyon",
      "vehicle.Kamyonet": "Kamyonet",
      "vehicle.Panelvan": "Panelvan",
      
      // Home page
      "home.hero.title": "Türkiye'nin En Hızlı Lojistik Pazaryeri",
      "home.hero.subtitle": "Nakliyeciler ve yük sahipleri arasında komisyonsuz bağlantı kurun",
      "home.hero.cta": "Hemen İlan Ver",
      "home.stats.listings": "Aktif İlan",
      "home.stats.companies": "Üye Firma",
      "home.stats.cities": "Şehir",
      
      // Forms
      "form.required": "Bu alan zorunludur",
      "form.email.invalid": "Geçerli bir email adresi giriniz",
      "form.password.min": "Şifre en az 6 karakter olmalıdır",
      "form.phone.invalid": "Geçerli bir telefon numarası giriniz",
      
      // Auth
      "auth.login.title": "Giriş Yap",
      "auth.register.title": "Kayıt Ol",
      "auth.email": "E-posta",
      "auth.password": "Şifre",
      "auth.confirmPassword": "Şifre Tekrarı",
      "auth.rememberMe": "Beni hatırla",
      "auth.forgotPassword": "Şifremi unuttum",
      "auth.noAccount": "Hesabınız yok mu?",
      "auth.hasAccount": "Zaten hesabınız var mı?",
      "auth.registerAs": "Kayıt türü",
      "auth.shipper": "Yük Sahibi",
      "auth.carrier": "Nakliyeci",
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.listings": "Listings",
      "nav.post": "Post Ad",
      "nav.pricing": "Pricing",
      "nav.about": "About",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.profile": "Profile",
      "nav.logout": "Logout",
      
      // Common
      "common.search": "Search",
      "common.filter": "Filter",
      "common.sort": "Sort",
      "common.clear": "Clear",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.contact": "Contact",
      "common.share": "Share",
      "common.loading": "Loading...",
      "common.noResults": "No results found",
      
      // Listing types
      "listing.load": "Load",
      "listing.capacity": "Capacity",
      "listing.loads": "Load Listings",
      "listing.capacities": "Vehicle/Capacity",
      
      // Vehicle types
      "vehicle.TIR": "Truck",
      "vehicle.Kamyon": "Truck",
      "vehicle.Kamyonet": "Van",
      "vehicle.Panelvan": "Panel Van",
      
      // Home page
      "home.hero.title": "Turkey's Fastest Logistics Marketplace",
      "home.hero.subtitle": "Connect carriers and shippers without commission",
      "home.hero.cta": "Post Listing Now",
      "home.stats.listings": "Active Listings",
      "home.stats.companies": "Member Companies",
      "home.stats.cities": "Cities",
      
      // Forms
      "form.required": "This field is required",
      "form.email.invalid": "Please enter a valid email address",
      "form.password.min": "Password must be at least 6 characters",
      "form.phone.invalid": "Please enter a valid phone number",
      
      // Auth
      "auth.login.title": "Login",
      "auth.register.title": "Register",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.rememberMe": "Remember me",
      "auth.forgotPassword": "Forgot password",
      "auth.noAccount": "Don't have an account?",
      "auth.hasAccount": "Already have an account?",
      "auth.registerAs": "Register as",
      "auth.shipper": "Shipper",
      "auth.carrier": "Carrier",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // default language
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;