import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PoliticalDashboard from '../PoliticalDashboard';
import type { ManufacturerPNS } from '../PoliticalDashboard';

const sampleManufacturers: ManufacturerPNS[] = [
  {
    id: '1',
    name: 'Zhejiang Pharma Co.',
    pnsScore: 0,
    productCount: 18,
    primaryCountry: 'China',
    baaEligible: false,
  },
  {
    id: '2',
    name: 'Pfizer Inc.',
    pnsScore: 100,
    productCount: 12,
    primaryCountry: 'United States',
    baaEligible: true,
  },
  {
    id: '3',
    name: 'Sun Pharmaceutical',
    pnsScore: 30,
    productCount: 8,
    primaryCountry: 'India',
    baaEligible: true,
  },
];

describe('PoliticalDashboard', () => {
  it('renders without errors', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    expect(screen.getByTestId('political-dashboard')).toBeInTheDocument();
  });

  it('displays manufacturer PNS scores table', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    expect(screen.getByText('Manufacturer PNS Scores')).toBeInTheDocument();
    expect(screen.getByText('Zhejiang Pharma Co.')).toBeInTheDocument();
    expect(screen.getByText('Pfizer Inc.')).toBeInTheDocument();
    expect(screen.getByText('Sun Pharmaceutical')).toBeInTheDocument();
  });

  it('displays V2 coming soon placeholders', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    const comingSoonCards = screen.getAllByTestId('coming-soon-card');
    expect(comingSoonCards).toHaveLength(3);
    expect(screen.getByText('Lobbying Data')).toBeInTheDocument();
    expect(screen.getByText('PAC Contributions')).toBeInTheDocument();
    expect(screen.getByText('Revolving Door Tracker')).toBeInTheDocument();
  });

  it('shows Coming in V2 badges', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    const v2Badges = screen.getAllByText('Coming in V2');
    expect(v2Badges).toHaveLength(3);
  });

  it('displays BAA eligibility badges', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    const eligibleBadges = screen.getAllByText('Eligible');
    const ineligibleBadges = screen.getAllByText('Ineligible');
    expect(eligibleBadges).toHaveLength(2);
    expect(ineligibleBadges).toHaveLength(1);
  });

  it('shows stat cards with correct values', () => {
    render(<PoliticalDashboard manufacturers={sampleManufacturers} />);
    expect(screen.getByText('Avg PNS Score')).toBeInTheDocument();
    expect(screen.getByText('BAA Eligible Manufacturers')).toBeInTheDocument();
    expect(screen.getByText('High-Risk Manufacturers')).toBeInTheDocument();
  });

  it('renders with empty manufacturers', () => {
    render(<PoliticalDashboard manufacturers={[]} />);
    expect(screen.getByTestId('political-dashboard')).toBeInTheDocument();
    expect(
      screen.getByText(/No manufacturers tracked yet/),
    ).toBeInTheDocument();
  });
});
