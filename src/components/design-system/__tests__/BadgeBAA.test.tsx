import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BadgeBAA from '../BadgeBAA';

describe('BadgeBAA', () => {
  it('renders eligible state with correct text', () => {
    render(<BadgeBAA eligible={true} />);
    expect(screen.getByText('BAA Eligible')).toBeInTheDocument();
  });

  it('renders not eligible state with correct text', () => {
    render(<BadgeBAA eligible={false} />);
    expect(screen.getByText('Not BAA Eligible')).toBeInTheDocument();
  });

  it('has correct aria-label for eligible state', () => {
    render(<BadgeBAA eligible={true} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'BAA Eligible');
  });

  it('has correct aria-label for not eligible state', () => {
    render(<BadgeBAA eligible={false} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'BAA Not Eligible');
  });

  it('renders checkmark SVG when eligible', () => {
    const { container } = render(<BadgeBAA eligible={true} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(1);
    expect(svgs[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders X SVG when not eligible', () => {
    const { container } = render(<BadgeBAA eligible={false} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(1);
  });

  it('applies green styling when eligible', () => {
    render(<BadgeBAA eligible={true} />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#27AE60]');
  });

  it('applies red styling when not eligible', () => {
    render(<BadgeBAA eligible={false} />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#C0392B]');
  });

  it('applies custom className', () => {
    render(<BadgeBAA eligible={true} className="ml-2" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('ml-2');
  });
});
