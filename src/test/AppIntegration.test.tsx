import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useProductStore } from '@/store';
import { useUIStore } from '@/store';
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

// Suppress console.warn from seed data / store loading
vi.spyOn(console, 'warn').mockImplementation(() => {});

const routes = [
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
    ],
  },
];

function renderWithRouter(initialPath: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialPath],
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  // Reset stores between tests
  useProductStore.setState({ products: [], isLoaded: false, isLoading: false });
  useUIStore.setState({ sidebarCollapsed: false, activePage: 'dashboard' });
  localStorage.clear();
});

describe('Route rendering', () => {
  const routeTests: Array<{ path: string; label: string }> = [
    { path: '/', label: 'Dashboard' },
    { path: '/search', label: 'Search' },
    { path: '/products', label: 'Product Database' },
    { path: '/product/seed-001', label: 'Product Detail' },
    { path: '/ingestion', label: 'Data Ingestion' },
    { path: '/risk', label: 'Risk Analyzer' },
    { path: '/geopolitical', label: 'Geopolitical Center' },
    { path: '/shortages', label: 'Shortage Warning' },
    { path: '/briefings', label: 'Briefing Generator' },
    { path: '/procurement', label: 'Procurement' },
  ];

  it.each(routeTests)(
    'renders $label at $path without crashing',
    async ({ path }) => {
      const { container } = renderWithRouter(path);
      expect(container).toBeTruthy();

      // AppShell should always be present
      await waitFor(() => {
        expect(screen.getByTestId('app-shell')).toBeInTheDocument();
      });

      // Sidebar should always be present
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    },
  );
});

describe('Sidebar navigation', () => {
  it('renders all visible navigation links', async () => {
    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    // All 9 visible nav items should be in the sidebar (ProductDetail is hidden)
    const sidebar = screen.getByTestId('sidebar');
    const links = sidebar.querySelectorAll('a');
    expect(links.length).toBe(9);
  });

  it('navigates to a different route when clicking a sidebar link', async () => {
    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    const searchLink = screen.getByText('Search');
    fireEvent.click(searchLink);

    // After clicking, the search link should be active (has gold styling)
    await waitFor(() => {
      expect(searchLink.closest('a')).toHaveClass('bg-gold/20');
    });
  });

  it('collapses and expands when toggle button is clicked', async () => {
    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    const sidebar = screen.getByTestId('sidebar');
    const toggleBtn = screen.getByTestId('sidebar-toggle');

    // Initially expanded (w-60)
    expect(sidebar.className).toContain('w-60');
    // Logo text should be in the sidebar (use within to scope)
    const { getByText: getSidebarText } = within(sidebar);
    expect(getSidebarText('iRemedy AI')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(sidebar.className).toContain('w-16');

    // Click to expand
    fireEvent.click(toggleBtn);
    expect(sidebar.className).toContain('w-60');
  });

  it('hides nav labels when collapsed', async () => {
    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    // Labels visible when expanded
    expect(screen.getByText('Dashboard')).toBeVisible();

    // Collapse
    fireEvent.click(screen.getByTestId('sidebar-toggle'));

    // Labels should not be rendered when collapsed
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});

describe('Seed data initialization', () => {
  it('loads seed data when product store is empty', async () => {
    // Start with empty store
    useProductStore.setState({ products: [], isLoaded: false, isLoading: false });

    renderWithRouter('/');

    // After mount, loadFromPersistence is called; store becomes loaded with empty products
    // Then seed data should be injected
    await waitFor(
      () => {
        const { products, isLoaded } = useProductStore.getState();
        expect(isLoaded).toBe(true);
        expect(products.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );

    // Verify the seed data contains expected products
    const state = useProductStore.getState();
    const lisinopril = state.getProductById('seed-001');
    expect(lisinopril).toBeDefined();
    expect(lisinopril?.name).toBe('Lisinopril 10mg');
  });

  it('does not overwrite existing products', async () => {
    // Pre-populate the store with a single product flagged as loaded
    const customProduct = {
      id: 'custom-001',
      ndc: '9999-9999-99',
      name: 'Custom Product',
      brandName: 'Custom',
      genericName: 'Custom Generic',
      manufacturer: 'Test Mfg',
      labelerName: 'Test',
      productType: 'prescription' as const,
      category: 'other' as const,
      schedule: 'unscheduled' as const,
      routeOfAdministration: 'oral' as const,
      dosageForm: 'Tablet',
      strength: '10',
      strengthUnit: 'mg',
      packageSize: '30',
      packageType: 'Bottle',
      description: 'Test product',
      activeIngredients: [{ name: 'Test', strength: '10', unit: 'mg' }],
      inactiveIngredients: [],
      indications: [],
      contraindications: [],
      warnings: [],
      sideEffects: [],
      interactions: [],
      storageConditions: '',
      requiresPrescription: true,
      isControlled: false,
      isAvailable: true,
      price: 10,
      currency: 'USD',
      fdaApprovalDate: '2020-01-01',
      expirationDate: '2027-01-01',
      lotNumber: 'TEST',
      barcode: '000000000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useProductStore.setState({
      products: [customProduct],
      isLoaded: true,
      isLoading: false,
    });

    renderWithRouter('/');

    // Wait a tick for effects to run
    await waitFor(() => {
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });

    // Store should still have only the custom product (seed data not added)
    const { products } = useProductStore.getState();
    expect(products.length).toBe(1);
    expect(products[0].id).toBe('custom-001');
  });
});
