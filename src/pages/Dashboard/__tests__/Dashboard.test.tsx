import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';
import Dashboard from '../Dashboard';

function makeProduct(overrides: Partial<DrugProduct> = {}): DrugProduct {
  return {
    id: crypto.randomUUID(),
    ndc: '0000-0000-00',
    name: 'Test Drug',
    brandName: 'TestBrand',
    genericName: 'testgeneric',
    labelerName: 'TestLab',
    manufacturer: 'USA Labs',
    productType: 'prescription',
    category: 'analgesic',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'tablet',
    strength: '100',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'bottle',
    description: 'A test drug product',
    activeIngredients: [],
    inactiveIngredients: [],
    indications: [],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 10,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function resetStore(products: DrugProduct[] = []) {
  useProductStore.setState({ products, isLoaded: true, isLoading: false });
}

describe('Dashboard', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders with empty product list and shows zero state', () => {
    render(<Dashboard />);

    expect(screen.getByText('iRemedy AI')).toBeInTheDocument();
    expect(screen.getByText('No products tracked yet')).toBeInTheDocument();
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();

    // Stats should show zeros (multiple cards show 0)
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('BAA Eligible')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('Average MIA Score')).toBeInTheDocument();

    // Design system components present
    expect(screen.getByTestId('floating-pills')).toBeInTheDocument();
    expect(screen.getByTestId('rotating-globe')).toBeInTheDocument();

    // No high-risk alerts
    expect(
      screen.getByText('No high-risk products detected'),
    ).toBeInTheDocument();

    // No country data
    expect(
      screen.getByText('No country data available'),
    ).toBeInTheDocument();
  });

  it('renders with 30+ products showing correct counts', () => {
    const products: DrugProduct[] = [];

    // 10 regular products (unscheduled, prescription, available) -> BAA eligible
    for (let i = 0; i < 10; i++) {
      products.push(
        makeProduct({
          name: `Regular Drug ${i}`,
          manufacturer: 'USA Labs',
          schedule: 'unscheduled',
          requiresPrescription: true,
          isAvailable: true,
        }),
      );
    }

    // 5 OTC products (not BAA eligible because not prescription)
    for (let i = 0; i < 5; i++) {
      products.push(
        makeProduct({
          name: `OTC Drug ${i}`,
          manufacturer: 'India Pharma',
          schedule: 'unscheduled',
          requiresPrescription: false,
          isAvailable: true,
        }),
      );
    }

    // 8 Schedule I products (critical risk) -> high risk alerts
    for (let i = 0; i < 8; i++) {
      products.push(
        makeProduct({
          name: `Controlled I Drug ${i}`,
          manufacturer: 'China Mfg',
          schedule: 'I',
          requiresPrescription: true,
          isAvailable: true,
          interactions: [
            { drugName: 'DrugA', severity: 'major', description: 'test' },
          ],
        }),
      );
    }

    // 4 Schedule III products (high risk) -> high risk alerts
    for (let i = 0; i < 4; i++) {
      products.push(
        makeProduct({
          name: `Controlled III Drug ${i}`,
          manufacturer: 'Germany AG',
          schedule: 'III',
          requiresPrescription: true,
          isAvailable: true,
        }),
      );
    }

    // 5 Schedule IV products (moderate risk)
    for (let i = 0; i < 5; i++) {
      products.push(
        makeProduct({
          name: `Schedule IV Drug ${i}`,
          manufacturer: 'USA Labs',
          schedule: 'IV',
          requiresPrescription: true,
          isAvailable: true,
        }),
      );
    }

    resetStore(products);
    render(<Dashboard />);

    // Total: 32 products
    expect(
      screen.getByText(/Tracking 32 products/),
    ).toBeInTheDocument();

    // Stats section exists
    expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();

    // BAA eligible: 10 regular + 8 Schedule I + 4 Schedule III + 5 Schedule IV = 27
    // (requiresPrescription=true AND isAvailable=true)
    expect(screen.getByText('27')).toBeInTheDocument();

    // High risk (critical from store - Schedule I/II): 8
    expect(screen.getByText('8')).toBeInTheDocument();

    // Chart and alerts panels exist
    expect(screen.getByTestId('api-source-chart')).toBeInTheDocument();
    expect(screen.getByTestId('high-risk-alerts')).toBeInTheDocument();

    // High-risk alerts should show items (Schedule I + III = 12 items)
    const alertItems = screen.getAllByTestId('risk-alert-item');
    expect(alertItems.length).toBe(12);
  });

  it('renders stat cards with correct BAA percentage', () => {
    const products = [
      makeProduct({ requiresPrescription: true, isAvailable: true }),
      makeProduct({ requiresPrescription: false, isAvailable: true }),
    ];
    resetStore(products);

    render(<Dashboard />);

    // 1 of 2 eligible = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders API source chart with country distribution', () => {
    const products = [
      makeProduct({ manufacturer: 'USA Labs' }),
      makeProduct({ manufacturer: 'USA Labs' }),
      makeProduct({ manufacturer: 'India Pharma' }),
    ];
    resetStore(products);

    render(<Dashboard />);

    expect(screen.getByTestId('api-source-chart')).toBeInTheDocument();
    expect(
      screen.getByText('API Source Country Distribution'),
    ).toBeInTheDocument();
  });

  it('renders design system components in hero banner', () => {
    render(<Dashboard />);

    // EagleIcon
    expect(screen.getByLabelText('Eagle icon')).toBeInTheDocument();

    // FloatingPills
    expect(screen.getByTestId('floating-pills')).toBeInTheDocument();

    // RotatingGlobe
    expect(screen.getByTestId('rotating-globe')).toBeInTheDocument();

    // GradientDivider(s)
    const dividers = screen.getAllByRole('separator');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });
});
