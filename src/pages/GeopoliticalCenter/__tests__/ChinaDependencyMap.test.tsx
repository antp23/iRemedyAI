import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChinaDependencyMap from '../ChinaDependencyMap';
import type { CountryAggregation } from '../ChinaDependencyMap';

const sampleData: CountryAggregation[] = [
  {
    countryCode: 'CN',
    countryName: 'China',
    productCount: 10,
    dependencyRatio: 0.4,
    tradeStatus: 'adversarial',
    geopoliticalNotes: 'Major API supplier',
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    productCount: 8,
    dependencyRatio: 0.32,
    tradeStatus: 'neutral',
    geopoliticalNotes: 'Generic drug manufacturer',
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    productCount: 7,
    dependencyRatio: 0.28,
    tradeStatus: 'allied',
    geopoliticalNotes: 'Domestic production',
  },
];

describe('ChinaDependencyMap', () => {
  it('renders without errors', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    expect(screen.getByTestId('china-dependency-map')).toBeInTheDocument();
  });

  it('renders the SVG map', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    expect(
      screen.getByRole('img', { name: /china dependency world map/i }),
    ).toBeInTheDocument();
  });

  it('displays China and India dependency summary cards', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    expect(screen.getByText('China Dependency')).toBeInTheDocument();
    expect(screen.getByText('India Dependency')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('32%')).toBeInTheDocument();
  });

  it('shows country risk profile on click', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    const chinaButton = screen.getByRole('button', { name: /china/i });
    fireEvent.click(chinaButton);
    expect(screen.getByText('Major API supplier')).toBeInTheDocument();
  });

  it('calls onCountryClick callback', () => {
    const onCountryClick = vi.fn();
    render(
      <ChinaDependencyMap
        countryData={sampleData}
        totalProducts={25}
        onCountryClick={onCountryClick}
      />,
    );
    const chinaButton = screen.getByRole('button', { name: /china/i });
    fireEvent.click(chinaButton);
    expect(onCountryClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('closes country risk profile when close button clicked', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    const chinaButton = screen.getByRole('button', { name: /china/i });
    fireEvent.click(chinaButton);
    expect(screen.getByText('Major API supplier')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close risk profile');
    fireEvent.click(closeButton);
    expect(screen.queryByText('Major API supplier')).not.toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<ChinaDependencyMap countryData={[]} totalProducts={0} />);
    expect(screen.getByTestId('china-dependency-map')).toBeInTheDocument();
    const zeroPercents = screen.getAllByText('0%');
    expect(zeroPercents.length).toBeGreaterThan(0);
  });

  it('displays the legend', () => {
    render(<ChinaDependencyMap countryData={sampleData} totalProducts={25} />);
    expect(screen.getByText(/Dependency:/)).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
  });
});
