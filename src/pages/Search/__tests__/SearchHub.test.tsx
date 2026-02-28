import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';

import SearchHub from '../SearchHub';

const mockProducts: DrugProduct[] = [
  {
    id: 'test-001',
    ndc: '0002-4462-30',
    name: 'Lisinopril 10mg',
    brandName: 'Prinivil',
    genericName: 'Lisinopril',
    labelerName: 'Merck',
    manufacturer: 'Merck & Co., USA',
    productType: 'prescription',
    category: 'cardiovascular',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Tablet',
    strength: '10',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: 'ACE inhibitor for hypertension',
    activeIngredients: [{ name: 'Lisinopril', strength: '10', unit: 'mg' }],
    inactiveIngredients: [],
    indications: ['Hypertension'],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Store at room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 12.5,
    currency: 'USD',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'test-002',
    ndc: '0006-0749-31',
    name: 'Metformin 500mg',
    brandName: 'Glucophage',
    genericName: 'Metformin Hydrochloride',
    labelerName: 'Bristol-Myers',
    manufacturer: 'Bristol-Myers Squibb, USA',
    productType: 'prescription',
    category: 'endocrine',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Tablet',
    strength: '500',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: 'Oral antidiabetic medication',
    activeIngredients: [
      { name: 'Metformin Hydrochloride', strength: '500', unit: 'mg' },
    ],
    inactiveIngredients: [],
    indications: ['Type 2 Diabetes'],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Store at room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 8.99,
    currency: 'USD',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'test-003',
    ndc: '65862-0176-30',
    name: 'Metoprolol Succinate 25mg ER',
    brandName: 'Toprol-XL Generic',
    genericName: 'Metoprolol Succinate',
    labelerName: 'Aurobindo',
    manufacturer: 'Aurobindo Pharma, India',
    productType: 'prescription',
    category: 'cardiovascular',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Extended-Release Tablet',
    strength: '25',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: 'Beta blocker for cardiovascular conditions',
    activeIngredients: [
      { name: 'Metoprolol Succinate', strength: '25', unit: 'mg' },
    ],
    inactiveIngredients: [],
    indications: ['Hypertension'],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Store at room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 7.5,
    currency: 'USD',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SearchHub', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset the store and populate with test products
    useProductStore.setState({ products: mockProducts, isLoaded: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    useProductStore.setState({ products: [], isLoaded: false });
  });

  it('renders the search input with correct placeholder', () => {
    renderWithRouter(<SearchHub />);
    const input = screen.getByTestId('search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute(
      'placeholder',
      'Search any drug, NDC code, or ask a question...',
    );
  });

  it('shows all products when query is empty', () => {
    renderWithRouter(<SearchHub />);
    expect(screen.getByTestId('search-results')).toBeInTheDocument();
    expect(screen.getByText('3 products found')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril 10mg')).toBeInTheDocument();
    expect(screen.getByText('Metformin 500mg')).toBeInTheDocument();
    expect(screen.getByText('Metoprolol Succinate 25mg ER')).toBeInTheDocument();
  });

  it('search by product name returns matches', () => {
    renderWithRouter(<SearchHub />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'Lisinopril' } });

    // Advance past debounce timer
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Lisinopril 10mg')).toBeInTheDocument();
    expect(screen.queryByText('Metformin 500mg')).not.toBeInTheDocument();
  });

  it('search by NDC code returns matches', () => {
    renderWithRouter(<SearchHub />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: '65862' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(
      screen.getByText('Metoprolol Succinate 25mg ER'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Lisinopril 10mg')).not.toBeInTheDocument();
  });

  it('shows no-results message when no products match', () => {
    renderWithRouter(<SearchHub />);
    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'zzzznonexistent' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(
      screen.getByText(/No products found. Try searching by name, NDC code, or therapeutic class./),
    ).toBeInTheDocument();
  });

  it('opens intelligence briefing when a product card is clicked', () => {
    renderWithRouter(<SearchHub />);

    const cards = screen.getAllByTestId('product-card');
    fireEvent.click(cards[0]);

    expect(screen.getByTestId('intelligence-briefing')).toBeInTheDocument();
    expect(screen.getByText('Drug Intelligence Profile')).toBeInTheDocument();
    expect(screen.getByText('Prinivil')).toBeInTheDocument();
  });

  it('closes intelligence briefing when close button is clicked', () => {
    renderWithRouter(<SearchHub />);

    const cards = screen.getAllByTestId('product-card');
    fireEvent.click(cards[0]);

    expect(screen.getByTestId('intelligence-briefing')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close briefing');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('intelligence-briefing')).not.toBeInTheDocument();
  });
});
