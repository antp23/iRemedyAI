import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BadgeRisk from '../BadgeRisk';

describe('BadgeRisk', () => {
  it('renders Low label for low risk', () => {
    render(<BadgeRisk level="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders Medium label for moderate risk', () => {
    render(<BadgeRisk level="moderate" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders High label for high risk', () => {
    render(<BadgeRisk level="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders Critical label for critical risk', () => {
    render(<BadgeRisk level="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('has correct aria-label for each level', () => {
    const { rerender } = render(<BadgeRisk level="low" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Risk level: Low');

    rerender(<BadgeRisk level="moderate" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Risk level: Medium');

    rerender(<BadgeRisk level="high" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Risk level: High');

    rerender(<BadgeRisk level="critical" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Risk level: Critical');
  });

  it('applies green color for low risk', () => {
    render(<BadgeRisk level="low" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#27AE60]');
  });

  it('applies yellow color for moderate risk', () => {
    render(<BadgeRisk level="moderate" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#D4AC0D]');
  });

  it('applies orange color for high risk', () => {
    render(<BadgeRisk level="high" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#E67E22]');
  });

  it('applies red color for critical risk', () => {
    render(<BadgeRisk level="critical" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('text-[#C0392B]');
  });

  it('renders a color indicator dot', () => {
    const { container } = render(<BadgeRisk level="low" />);
    const dot = container.querySelector('.rounded-full.h-2.w-2');
    expect(dot).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BadgeRisk level="low" className="mr-2" />);
    const badge = screen.getByRole('status');
    expect(badge.className).toContain('mr-2');
  });
});
