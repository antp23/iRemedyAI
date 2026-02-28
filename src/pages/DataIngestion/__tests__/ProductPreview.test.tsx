import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductPreview from '../ProductPreview';
import { useProductStore } from '@/store';

const mockData: Record<string, unknown> = {
  fdaData: {
    drugName: 'Amoxicillin',
    brandName: 'Amoxil',
    genericName: 'Amoxicillin Trihydrate',
    ndc: '0069-3150-83',
    manufacturer: 'Pfizer Inc.',
    dosageForm: 'Capsule',
    strength: '500mg',
    routeOfAdministration: 'oral',
  },
  originData: {
    apiCountry: 'United States',
    fgCountry: 'United States',
    taaCompliant: true,
    baaEligible: true,
  },
  pricingData: {
    wacPrice: 25.99,
    awpPrice: 31.19,
  },
  compiledReport: {
    miaScore: 92,
    coorsScore: 85,
    riskLevel: 'low',
    recommendation: 'Product approved for government procurement',
    complianceConcerns: [],
  },
};

describe('ProductPreview', () => {
  const onConfirm = vi.fn();
  const onDiscard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the product store
    useProductStore.setState({ products: [] });
  });

  it('renders product name and details', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );
    expect(screen.getByText('Amoxicillin')).toBeInTheDocument();
    expect(screen.getByText(/Amoxicillin Trihydrate/)).toBeInTheDocument();
    expect(screen.getByText(/0069-3150-83/)).toBeInTheDocument();
  });

  it('renders score rings', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );
    expect(screen.getByText('MIA')).toBeInTheDocument();
    expect(screen.getByText('COORS')).toBeInTheDocument();
  });

  it('renders BAA badge and risk badge', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );
    expect(screen.getByText('BAA Eligible')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders confirm and discard buttons', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );
    expect(screen.getByTestId('confirm-btn')).toBeInTheDocument();
    expect(screen.getByTestId('discard-btn')).toBeInTheDocument();
  });

  it('calls onConfirm and adds product to store when confirm is clicked', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByTestId('confirm-btn'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    // Product should be added to the store
    const products = useProductStore.getState().products;
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Amoxicillin');
  });

  it('shows confirmation message after confirming', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByTestId('confirm-btn'));

    expect(screen.getByTestId('product-confirmed')).toBeInTheDocument();
    expect(screen.getByText(/saved/)).toBeInTheDocument();
  });

  it('calls onDiscard when discard is clicked', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByTestId('discard-btn'));

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('shows discard message after discarding', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByTestId('discard-btn'));

    expect(screen.getByTestId('product-discarded')).toBeInTheDocument();
    expect(screen.getByText(/discarded/)).toBeInTheDocument();
  });

  it('does not add product to store when discarded', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByTestId('discard-btn'));

    const products = useProductStore.getState().products;
    expect(products).toHaveLength(0);
  });

  it('shows raw response for malformed data', () => {
    const malformed = { someRandomField: 'test' };
    render(
      <ProductPreview data={malformed} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    expect(screen.getByText('Raw Response')).toBeInTheDocument();
  });

  it('renders recommendation when present', () => {
    render(
      <ProductPreview data={mockData} onConfirm={onConfirm} onDiscard={onDiscard} />,
    );

    expect(screen.getByText('Recommendation')).toBeInTheDocument();
    expect(
      screen.getByText('Product approved for government procurement'),
    ).toBeInTheDocument();
  });
});
