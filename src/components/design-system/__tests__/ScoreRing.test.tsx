import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScoreRing from '../ScoreRing';

describe('ScoreRing', () => {
  it('renders with default props', () => {
    render(<ScoreRing score={75} />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
  });

  it('displays the correct score in aria attributes', () => {
    render(<ScoreRing score={85} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '85');
  });

  it('clamps score to 0-100 range', () => {
    render(<ScoreRing score={150} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps negative score to 0', () => {
    render(<ScoreRing score={-10} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders label when provided', () => {
    render(<ScoreRing score={50} label="Safety" />);
    expect(screen.getByText('Safety')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<ScoreRing score={50} />);
    const span = container.querySelector('span');
    expect(span).not.toBeInTheDocument();
  });

  it('includes label in aria-label', () => {
    render(<ScoreRing score={42} label="Quality" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'Quality: 42%');
  });

  it('renders SVG element', () => {
    const { container } = render(<ScoreRing score={60} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ScoreRing score={50} className="mt-4" />);
    const meter = screen.getByRole('meter');
    expect(meter.className).toContain('mt-4');
  });

  it('respects custom size', () => {
    const { container } = render(<ScoreRing score={50} size={200} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});
