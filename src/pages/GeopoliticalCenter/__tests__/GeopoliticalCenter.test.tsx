import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: [],
    addProduct: vi.fn(),
    removeProduct: vi.fn(),
    getById: vi.fn(),
    baaEligible: [],
    highRisk: [],
    averageMIA: 0,
    productsByCountry: new Map(),
  }),
}));

import GeopoliticalCenter from '../GeopoliticalCenter';

describe('GeopoliticalCenter', () => {
  it('renders without errors', () => {
    render(<GeopoliticalCenter />);
    expect(screen.getByTestId('geopolitical-center')).toBeInTheDocument();
  });

  it('displays the page title', () => {
    render(<GeopoliticalCenter />);
    expect(
      screen.getByText('Geopolitical Intelligence Center'),
    ).toBeInTheDocument();
  });

  it('displays tab navigation', () => {
    render(<GeopoliticalCenter />);
    expect(screen.getByText('China Dependency Map')).toBeInTheDocument();
    expect(screen.getByText('Political Dashboard')).toBeInTheDocument();
  });

  it('renders China dependency map by default', () => {
    render(<GeopoliticalCenter />);
    expect(screen.getByTestId('china-dependency-map')).toBeInTheDocument();
  });

  it('switches to political dashboard tab', () => {
    render(<GeopoliticalCenter />);
    fireEvent.click(screen.getByText('Political Dashboard'));
    expect(screen.getByTestId('political-dashboard')).toBeInTheDocument();
  });

  it('renders sample data when no products are tracked', () => {
    render(<GeopoliticalCenter />);
    // Sample data should show China dependency
    expect(screen.getByText('China Dependency')).toBeInTheDocument();
    expect(screen.getByText('India Dependency')).toBeInTheDocument();
  });
});
