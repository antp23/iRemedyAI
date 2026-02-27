import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ScoreRing,
  BadgeBAA,
  BadgeRisk,
  StatCard,
  GradientDivider,
  EagleIcon,
  FloatingPills,
  RotatingGlobe,
  PatrioticButton,
} from '../index';

describe('Design System Smoke Tests', () => {
  it('renders ScoreRing without errors', () => {
    const { container } = render(<ScoreRing score={50} label="Test" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders BadgeBAA without errors', () => {
    const { container } = render(<BadgeBAA eligible={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders BadgeRisk without errors', () => {
    const { container } = render(<BadgeRisk level="low" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders StatCard without errors', () => {
    const icon = <span data-testid="icon">*</span>;
    render(<StatCard icon={icon} value={42} label="Total" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders StatCard with trend indicator', () => {
    const icon = <span>*</span>;
    render(
      <StatCard
        icon={icon}
        value="$1,234"
        label="Revenue"
        trend={{ direction: 'up', value: '+12%' }}
      />
    );
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders GradientDivider without errors', () => {
    const { container } = render(<GradientDivider />);
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('renders EagleIcon without errors', () => {
    const { container } = render(<EagleIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders EagleIcon with custom size', () => {
    const { container } = render(<EagleIcon size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
  });

  it('renders FloatingPills without errors', () => {
    render(<FloatingPills />);
    expect(screen.getByTestId('floating-pills')).toBeInTheDocument();
  });

  it('renders FloatingPills with custom count', () => {
    render(<FloatingPills count={5} />);
    const container = screen.getByTestId('floating-pills');
    expect(container.children).toHaveLength(5);
  });

  it('renders RotatingGlobe without errors', () => {
    render(<RotatingGlobe />);
    expect(screen.getByTestId('rotating-globe')).toBeInTheDocument();
  });

  it('renders PatrioticButton without errors', () => {
    render(<PatrioticButton>Click me</PatrioticButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders PatrioticButton in loading state', () => {
    render(<PatrioticButton loading>Submit</PatrioticButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders PatrioticButton as disabled', () => {
    render(<PatrioticButton disabled>Save</PatrioticButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('all components accept className prop', () => {
    const { container } = render(
      <div>
        <ScoreRing score={50} className="test-score" />
        <BadgeBAA eligible={true} className="test-baa" />
        <BadgeRisk level="low" className="test-risk" />
        <StatCard icon={<span />} value={0} label="x" className="test-stat" />
        <GradientDivider className="test-divider" />
        <EagleIcon className="test-eagle" />
        <FloatingPills className="test-pills" />
        <RotatingGlobe className="test-globe" />
        <PatrioticButton className="test-button">X</PatrioticButton>
      </div>
    );
    expect(container.querySelector('.test-score')).toBeInTheDocument();
    expect(container.querySelector('.test-baa')).toBeInTheDocument();
    expect(container.querySelector('.test-risk')).toBeInTheDocument();
    expect(container.querySelector('.test-stat')).toBeInTheDocument();
    expect(container.querySelector('.test-divider')).toBeInTheDocument();
    expect(container.querySelector('.test-eagle')).toBeInTheDocument();
    expect(container.querySelector('.test-pills')).toBeInTheDocument();
    expect(container.querySelector('.test-globe')).toBeInTheDocument();
    expect(container.querySelector('.test-button')).toBeInTheDocument();
  });
});
