import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '../ProductCard';
import type { DrugProduct } from '@/types';

const mockProduct: DrugProduct = {
  id: 'prod-001',
  ndc: '12345-678-90',
  name: 'Metformin HCl',
  brandName: 'Glucophage',
  genericName: 'Metformin Hydrochloride',
  labelerName: 'Bristol-Myers Squibb',
  manufacturer: 'Teva Pharmaceuticals',
  productType: 'prescription',
  category: 'endocrine',
  schedule: 'unscheduled',
  routeOfAdministration: 'oral',
  dosageForm: 'Tablet',
  strength: '500mg',
  strengthUnit: 'mg',
  packageSize: '100',
  packageType: 'Bottle',
  description: 'Oral antidiabetic medication',
  activeIngredients: [{ name: 'Metformin HCl', strength: '500', unit: 'mg' }],
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
  price: 12.99,
  currency: 'USD',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProductCard', () => {
  const defaultProps = {
    product: mockProduct,
    miaScore: 85,
    apiSourceCountry: 'India',
    apiSourceCountryCode: 'IN',
    baaEligible: true,
    riskLevel: 'low' as const,
  };

  it('renders the product card', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });

  it('displays the product name', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Metformin HCl')).toBeInTheDocument();
  });

  it('displays the strength and manufacturer', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText(/500mg/)).toBeInTheDocument();
    expect(screen.getByText(/Teva Pharmaceuticals/)).toBeInTheDocument();
  });

  it('displays the API source country', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('India')).toBeInTheDocument();
  });

  it('displays the BAA badge', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('BAA Eligible')).toBeInTheDocument();
  });

  it('displays the risk badge', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays the MIA score ring', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });

  it('displays the country flag', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByTestId('country-flag-IN')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ProductCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('product-card'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick on Enter key press', () => {
    const onClick = vi.fn();
    render(<ProductCard {...defaultProps} onClick={onClick} />);
    fireEvent.keyDown(screen.getByTestId('product-card'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });
});
