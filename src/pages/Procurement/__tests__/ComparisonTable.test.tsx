import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComparisonTable from '../ComparisonTable';
import type { ProcurementProduct } from '../ComparisonTable';

function makeProduct(overrides: Partial<ProcurementProduct> = {}): ProcurementProduct {
  return {
    id: crypto.randomUUID(),
    name: 'Test Drug',
    manufacturer: 'Test Mfg',
    therapeuticClass: 'analgesic',
    miaScore: 80,
    coorsScore: 75,
    qrsScore: 70,
    baaEligible: false,
    awpPrice: 50.0,
    fssPrice: 35.0,
    riskLevel: 'moderate',
    sourceCountry: 'United States',
    ...overrides,
  };
}

describe('ComparisonTable', () => {
  it('renders all column headers', () => {
    render(<ComparisonTable products={[makeProduct()]} />);
    const table = screen.getByTestId('comparison-table');

    expect(within(table).getByText('Product')).toBeInTheDocument();
    expect(within(table).getByText('Manufacturer')).toBeInTheDocument();
    expect(within(table).getByText('MIA Score')).toBeInTheDocument();
    expect(within(table).getByText('COORS')).toBeInTheDocument();
    expect(within(table).getByText('QRS')).toBeInTheDocument();
    expect(within(table).getByText('AWP Price')).toBeInTheDocument();
    expect(within(table).getByText('FSS Price')).toBeInTheDocument();
    expect(within(table).getByText('Risk Level')).toBeInTheDocument();
    expect(within(table).getByText('Source Country')).toBeInTheDocument();
    expect(within(table).getByText('BAA')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    render(<ComparisonTable products={[]} />);
    expect(
      screen.getByText('No products tracked in this category'),
    ).toBeInTheDocument();
  });

  it('renders all product rows', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'Drug A' }),
      makeProduct({ id: 'p2', name: 'Drug B' }),
      makeProduct({ id: 'p3', name: 'Drug C' }),
    ];
    render(<ComparisonTable products={products} />);

    expect(screen.getByTestId('product-row-p1')).toBeInTheDocument();
    expect(screen.getByTestId('product-row-p2')).toBeInTheDocument();
    expect(screen.getByTestId('product-row-p3')).toBeInTheDocument();
  });

  it('displays formatted prices', () => {
    render(
      <ComparisonTable
        products={[makeProduct({ id: 'p1', awpPrice: 123.4, fssPrice: 99.99 })]}
      />,
    );
    const row = screen.getByTestId('product-row-p1');
    expect(within(row).getByText('$123.40')).toBeInTheDocument();
    expect(within(row).getByText('$99.99')).toBeInTheDocument();
  });

  describe('sorting', () => {
    const products: ProcurementProduct[] = [
      makeProduct({ id: 'low', name: 'Alpha', miaScore: 60, awpPrice: 10 }),
      makeProduct({ id: 'high', name: 'Charlie', miaScore: 95, awpPrice: 50 }),
      makeProduct({ id: 'mid', name: 'Bravo', miaScore: 80, awpPrice: 30 }),
    ];

    it('sorts by MIA score descending by default', () => {
      render(<ComparisonTable products={products} />);
      const rows = screen.getAllByTestId(/^product-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'product-row-high');
      expect(rows[1]).toHaveAttribute('data-testid', 'product-row-mid');
      expect(rows[2]).toHaveAttribute('data-testid', 'product-row-low');
    });

    it('sorts by name ascending when Product header clicked', () => {
      render(<ComparisonTable products={products} />);

      fireEvent.click(screen.getByText('Product'));

      const rows = screen.getAllByTestId(/^product-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'product-row-low');
      expect(rows[1]).toHaveAttribute('data-testid', 'product-row-mid');
      expect(rows[2]).toHaveAttribute('data-testid', 'product-row-high');
    });

    it('toggles sort direction on repeated click', () => {
      render(<ComparisonTable products={products} />);

      // Click MIA Score (already sorted desc) — toggles to asc
      fireEvent.click(screen.getByText('MIA Score'));

      const rows = screen.getAllByTestId(/^product-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'product-row-low');
      expect(rows[2]).toHaveAttribute('data-testid', 'product-row-high');
    });

    it('sorts by AWP Price', () => {
      render(<ComparisonTable products={products} />);

      fireEvent.click(screen.getByText('AWP Price'));

      const rows = screen.getAllByTestId(/^product-row-/);
      // Numeric columns default to desc
      expect(rows[0]).toHaveAttribute('data-testid', 'product-row-high');
      expect(rows[2]).toHaveAttribute('data-testid', 'product-row-low');
    });

    it('sorts by risk level', () => {
      const riskProducts = [
        makeProduct({ id: 'r-low', riskLevel: 'low' }),
        makeProduct({ id: 'r-crit', riskLevel: 'critical' }),
        makeProduct({ id: 'r-mod', riskLevel: 'moderate' }),
      ];
      render(<ComparisonTable products={riskProducts} />);

      fireEvent.click(screen.getByText('Risk Level'));

      const rows = screen.getAllByTestId(/^product-row-/);
      // Risk defaults to desc sort, so critical first
      expect(rows[0]).toHaveAttribute('data-testid', 'product-row-r-crit');
      expect(rows[1]).toHaveAttribute('data-testid', 'product-row-r-mod');
      expect(rows[2]).toHaveAttribute('data-testid', 'product-row-r-low');
    });

    it('sets aria-sort on the active column header', () => {
      render(<ComparisonTable products={products} />);

      // Default: MIA score desc
      const miaHeader = screen.getByText('MIA Score').closest('th')!;
      expect(miaHeader).toHaveAttribute('aria-sort', 'descending');

      // Click Product header
      fireEvent.click(screen.getByText('Product'));
      const nameHeader = screen.getByText('Product').closest('th')!;
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      expect(miaHeader).toHaveAttribute('aria-sort', 'none');
    });
  });

  describe('best option highlighting', () => {
    it('highlights the product with the best composite score', () => {
      const products = [
        makeProduct({
          id: 'best',
          miaScore: 95,
          coorsScore: 90,
          qrsScore: 92,
          riskLevel: 'low',
        }),
        makeProduct({
          id: 'worse',
          miaScore: 60,
          coorsScore: 55,
          qrsScore: 50,
          riskLevel: 'high',
        }),
      ];
      render(<ComparisonTable products={products} />);

      const bestRow = screen.getByTestId('product-row-best');
      expect(within(bestRow).getByTestId('best-badge')).toBeInTheDocument();

      const worseRow = screen.getByTestId('product-row-worse');
      expect(within(worseRow).queryByTestId('best-badge')).not.toBeInTheDocument();
    });
  });
});
