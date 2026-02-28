import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Procurement from '../Procurement';

describe('Procurement', () => {
  it('renders page heading and description', () => {
    render(<Procurement />);
    expect(screen.getByText('Procurement Comparison')).toBeInTheDocument();
    expect(
      screen.getByText(/Compare therapeutically equivalent products/),
    ).toBeInTheDocument();
  });

  it('renders therapeutic class filter', () => {
    render(<Procurement />);
    const select = screen.getByTestId('class-filter');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('all');
  });

  it('renders BAA toggle', () => {
    render(<Procurement />);
    const toggle = screen.getByTestId('baa-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders comparison table with all mock products by default', () => {
    render(<Procurement />);
    const table = screen.getByTestId('comparison-table');
    expect(table).toBeInTheDocument();
    // Default "all" shows all 16 mock products
    expect(screen.getByText('16 products found')).toBeInTheDocument();
  });

  describe('therapeutic class filtering', () => {
    it('filters to only cardiovascular products', () => {
      render(<Procurement />);

      fireEvent.change(screen.getByTestId('class-filter'), {
        target: { value: 'cardiovascular' },
      });

      expect(screen.getByText('4 products found')).toBeInTheDocument();
      // Verify a cardiovascular product is visible
      expect(screen.getByTestId('product-row-proc-1')).toBeInTheDocument();
    });

    it('shows empty state for a category with no products', () => {
      render(<Procurement />);

      fireEvent.change(screen.getByTestId('class-filter'), {
        target: { value: 'dermatological' },
      });

      expect(
        screen.getByText('No products tracked in this category'),
      ).toBeInTheDocument();
      expect(screen.getByText('0 products found')).toBeInTheDocument();
    });
  });

  describe('BAA filter', () => {
    it('shows only BAA eligible products when toggle is on', () => {
      render(<Procurement />);

      const toggle = screen.getByTestId('baa-toggle');
      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-checked', 'true');
      // 8 of 16 mock products are BAA eligible
      expect(screen.getByText('8 products found')).toBeInTheDocument();

      // Verify a BAA eligible product is shown
      expect(screen.getByTestId('product-row-proc-1')).toBeInTheDocument();
      // Verify a non-eligible product is hidden
      expect(screen.queryByTestId('product-row-proc-2')).not.toBeInTheDocument();
    });

    it('combines BAA filter with therapeutic class filter', () => {
      render(<Procurement />);

      fireEvent.change(screen.getByTestId('class-filter'), {
        target: { value: 'cardiovascular' },
      });
      fireEvent.click(screen.getByTestId('baa-toggle'));

      // Cardiovascular + BAA: proc-1 and proc-3
      expect(screen.getByText('2 products found')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-proc-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-row-proc-3')).toBeInTheDocument();
      expect(screen.queryByTestId('product-row-proc-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-row-proc-4')).not.toBeInTheDocument();
    });

    it('toggles BAA filter back off', () => {
      render(<Procurement />);

      const toggle = screen.getByTestId('baa-toggle');
      fireEvent.click(toggle); // on
      fireEvent.click(toggle); // off

      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByText('16 products found')).toBeInTheDocument();
    });
  });

  describe('BAA badge rendering', () => {
    it('displays BAA Eligible badge for eligible products', () => {
      render(<Procurement />);
      const row = screen.getByTestId('product-row-proc-1');
      expect(within(row).getByText('BAA Eligible')).toBeInTheDocument();
    });

    it('displays Not BAA Eligible badge for non-eligible products', () => {
      render(<Procurement />);
      const row = screen.getByTestId('product-row-proc-2');
      expect(within(row).getByText('Not BAA Eligible')).toBeInTheDocument();
    });
  });
});
