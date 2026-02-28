import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AlternativeTracker from '../AlternativeTracker';
import type { DrugProduct } from '@/types';

function makeProduct(overrides: Partial<DrugProduct> & { id: string; name: string }): DrugProduct {
  return {
    ndc: '00000-0000-00',
    brandName: overrides.name,
    genericName: overrides.name,
    labelerName: 'Test Lab',
    manufacturer: 'Test Manufacturer, USA',
    productType: 'prescription',
    category: 'cardiovascular',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Tablet',
    strength: '10',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: 'Test drug product',
    activeIngredients: [{ name: 'TestDrug', strength: '10', unit: 'mg' }],
    inactiveIngredients: [],
    indications: [],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 10.0,
    currency: 'USD',
    fdaApprovalDate: '2020-01-01',
    lotNumber: 'LOT-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('AlternativeTracker', () => {
  const shortageProduct = makeProduct({
    id: 'shortage-1',
    name: 'Losartan 25mg CN',
    manufacturer: 'Zhejiang Pharma, China',
    category: 'cardiovascular',
    activeIngredients: [{ name: 'Losartan Potassium', strength: '25', unit: 'mg' }],
  });

  it('renders the alternative tracker', () => {
    render(<AlternativeTracker product={shortageProduct} alternatives={[]} />);
    expect(screen.getByTestId('alternative-tracker')).toBeInTheDocument();
  });

  it('shows no-alternatives message when no alternatives exist', () => {
    render(<AlternativeTracker product={shortageProduct} alternatives={[]} />);
    expect(screen.getByTestId('no-alternatives')).toBeInTheDocument();
    expect(
      screen.getByText('No alternatives found in the same therapeutic category.'),
    ).toBeInTheDocument();
  });

  it('finds and displays therapeutic equivalents', () => {
    const alternatives = [
      makeProduct({
        id: 'alt-1',
        name: 'Losartan 50mg US',
        manufacturer: 'Merck, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Losartan Potassium', strength: '50', unit: 'mg' }],
      }),
      makeProduct({
        id: 'alt-2',
        name: 'Valsartan 80mg',
        manufacturer: 'Novartis, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Valsartan', strength: '80', unit: 'mg' }],
      }),
    ];

    render(<AlternativeTracker product={shortageProduct} alternatives={alternatives} />);
    expect(screen.getByTestId('alternatives-list')).toBeInTheDocument();
    const items = screen.getAllByTestId('alternative-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('Losartan 50mg US')).toBeInTheDocument();
    expect(screen.getByText('Valsartan 80mg')).toBeInTheDocument();
  });

  it('marks exact matches by shared active ingredient', () => {
    const alternatives = [
      makeProduct({
        id: 'alt-1',
        name: 'Losartan 50mg Generic',
        manufacturer: 'Teva, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Losartan Potassium', strength: '50', unit: 'mg' }],
      }),
      makeProduct({
        id: 'alt-2',
        name: 'Amlodipine 5mg',
        manufacturer: 'Pfizer, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Amlodipine Besylate', strength: '5', unit: 'mg' }],
      }),
    ];

    render(<AlternativeTracker product={shortageProduct} alternatives={alternatives} />);
    const badges = screen.getAllByTestId('match-badge');
    const badgeTexts = badges.map((b) => b.textContent);
    expect(badgeTexts).toContain('Exact');
    expect(badgeTexts).toContain('Therapeutic');
  });

  it('sorts exact matches before therapeutic equivalents', () => {
    const alternatives = [
      makeProduct({
        id: 'alt-1',
        name: 'Amlodipine 5mg',
        manufacturer: 'Pfizer, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Amlodipine Besylate', strength: '5', unit: 'mg' }],
      }),
      makeProduct({
        id: 'alt-2',
        name: 'Losartan 50mg US',
        manufacturer: 'Merck, USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Losartan Potassium', strength: '50', unit: 'mg' }],
      }),
    ];

    render(<AlternativeTracker product={shortageProduct} alternatives={alternatives} />);
    const items = screen.getAllByTestId('alternative-item');
    // Exact match (Losartan) should appear first
    expect(items[0]).toHaveTextContent('Losartan 50mg US');
    expect(items[1]).toHaveTextContent('Amlodipine 5mg');
  });

  it('displays compliance scores for each alternative', () => {
    const alternatives = [
      makeProduct({
        id: 'alt-1',
        name: 'US Alternative',
        manufacturer: 'Pfizer Inc., USA',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'TestDrug', strength: '10', unit: 'mg' }],
      }),
    ];

    render(<AlternativeTracker product={shortageProduct} alternatives={alternatives} />);
    // Should show ScoreRing (meter role) for compliance
    expect(screen.getAllByRole('meter').length).toBeGreaterThanOrEqual(1);
  });

  it('shows summary count of alternatives', () => {
    const alternatives = [
      makeProduct({
        id: 'alt-1',
        name: 'Alt 1',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Losartan Potassium', strength: '50', unit: 'mg' }],
      }),
      makeProduct({
        id: 'alt-2',
        name: 'Alt 2',
        category: 'cardiovascular',
        activeIngredients: [{ name: 'Valsartan', strength: '80', unit: 'mg' }],
      }),
    ];

    render(<AlternativeTracker product={shortageProduct} alternatives={alternatives} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/alternative/)).toBeInTheDocument();
  });
});
