import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Home } from '@/pages/Home';
import { Browse } from '@/pages/Browse';
import { PostListing } from '@/pages/PostListing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ListingDetail } from '@/pages/ListingDetail';
import { Profile } from '@/pages/Profile';
import { Messages } from '@/pages/Messages';
import { Notifications } from '@/pages/Notifications';
import { Vehicles } from '@/pages/Vehicles';
import { Favorites } from '@/pages/Favorites';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><Home /></AppLayout>,
  },
  {
    path: '/listings',
    element: <AppLayout><Browse /></AppLayout>,
  },
  {
    path: '/listings',
    element: <AppLayout><Browse /></AppLayout>,
  },
  {
    path: '/listings/:id',
    element: <AppLayout><ListingDetail /></AppLayout>,
  },
  {
    path: '/profiles/:id',
    element: <AppLayout><Profile /></AppLayout>,
  },
  {
    path: '/messages',
    element: <AppLayout><Messages /></AppLayout>,
  },
  {
    path: '/notifications',
    element: <AppLayout><Notifications /></AppLayout>,
  },
  {
    path: '/vehicles',
    element: <AppLayout><Vehicles /></AppLayout>,
  },
  {
    path: '/favorites',
    element: <AppLayout><Favorites /></AppLayout>,
  },

  {
    path: '/post',
    element: <AppLayout><PostListing /></AppLayout>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/about',
    element: <AppLayout><div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Hakkında sayfası yakında...</h1></div></AppLayout>,
  },
]);