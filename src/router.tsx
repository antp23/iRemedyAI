import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { SymptomChecker } from '@/pages/SymptomChecker';
import { Appointments } from '@/pages/Appointments';
import { Profile } from '@/pages/Profile';
import { Login, Register } from '@/pages/Auth';
import { NotFound } from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'symptoms', element: <SymptomChecker /> },
      { path: 'appointments', element: <Appointments /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/register', element: <Register /> },
  { path: '*', element: <NotFound /> },
]);
