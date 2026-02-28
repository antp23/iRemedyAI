import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { Dashboard } from '@/pages/Dashboard';
import { SearchHub } from '@/pages/Search';
import { ProductList } from '@/pages/ProductDatabase';
import { ProductDetail } from '@/pages/ProductDetail';
import { IngestionHub } from '@/pages/DataIngestion';
import { RiskAnalyzer } from '@/pages/RiskAnalyzer';
import { GeopoliticalCenter } from '@/pages/GeopoliticalCenter';
import { ShortageWarning } from '@/pages/ShortageWarning';
import { BriefingGenerator } from '@/pages/BriefingGenerator';
import { Procurement } from '@/pages/Procurement';
import { Appointments } from '@/pages/Appointments';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';
import { SymptomChecker } from '@/pages/SymptomChecker';
import { NotFound } from '@/pages/NotFound';
import { Login, Register } from '@/pages/Auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'search', element: <SearchHub /> },
      { path: 'products', element: <ProductList /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'ingestion', element: <IngestionHub /> },
      { path: 'risk', element: <RiskAnalyzer /> },
      { path: 'geopolitical', element: <GeopoliticalCenter /> },
      { path: 'shortages', element: <ShortageWarning /> },
      { path: 'briefings', element: <BriefingGenerator /> },
      { path: 'procurement', element: <Procurement /> },
      { path: 'appointments', element: <Appointments /> },
      { path: 'home', element: <Home /> },
      { path: 'profile', element: <Profile /> },
      { path: 'symptom-checker', element: <SymptomChecker /> },
    ],
  },
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/register', element: <Register /> },
  { path: '*', element: <NotFound /> },
]);
