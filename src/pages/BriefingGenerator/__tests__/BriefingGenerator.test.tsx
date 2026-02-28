import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useProducts before importing the component
vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: [
      {
        id: '1',
        ndc: '12345-678-90',
        name: 'Test Drug',
        brandName: 'TestBrand',
        genericName: 'Testcillin',
        labelerName: 'Test Pharma',
        manufacturer: 'Test Pharma Inc.',
        category: 'antibiotic',
        productType: 'prescription',
        strength: '500',
        strengthUnit: 'mg',
        price: 25.99,
        currency: 'USD',
        schedule: 'unscheduled',
        requiresPrescription: true,
        activeIngredients: [{ name: 'Testcillin', strength: '500', unit: 'mg' }],
        indications: ['bacterial infection'],
        description: 'A test antibiotic product',
      },
    ],
    addProduct: vi.fn(),
    removeProduct: vi.fn(),
    getById: vi.fn(),
    baaEligible: [],
    highRisk: [],
    averageMIA: 0,
    productsByCountry: new Map(),
  }),
}));

import BriefingGenerator from '../BriefingGenerator';

describe('BriefingGenerator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page title and description', () => {
    render(<BriefingGenerator />);
    expect(screen.getByText('Intelligence Briefing Generator')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Generate AI-powered intelligence briefings on any topic, product, or risk area.',
      ),
    ).toBeInTheDocument();
  });

  it('renders topic input and audience selector', () => {
    render(<BriefingGenerator />);
    expect(screen.getByLabelText('Briefing Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Audience')).toBeInTheDocument();
  });

  it('renders all audience options', () => {
    render(<BriefingGenerator />);
    const select = screen.getByLabelText('Target Audience') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(['Congressional', 'Executive', 'Procurement', 'Clinical']);
  });

  it('audience selector changes value', () => {
    render(<BriefingGenerator />);
    const select = screen.getByLabelText('Target Audience') as HTMLSelectElement;

    expect(select.value).toBe('Congressional');

    fireEvent.change(select, { target: { value: 'Clinical' } });
    expect(select.value).toBe('Clinical');

    fireEvent.change(select, { target: { value: 'Procurement' } });
    expect(select.value).toBe('Procurement');

    fireEvent.change(select, { target: { value: 'Executive' } });
    expect(select.value).toBe('Executive');
  });

  it('generate button is disabled when topic is empty', () => {
    render(<BriefingGenerator />);
    const button = screen.getByRole('button', { name: /generate briefing/i });
    expect(button).toBeDisabled();
  });

  it('generate button is enabled when topic has text', () => {
    render(<BriefingGenerator />);
    const input = screen.getByLabelText('Briefing Topic');
    fireEvent.change(input, { target: { value: 'Insulin pricing' } });
    const button = screen.getByRole('button', { name: /generate briefing/i });
    expect(button).not.toBeDisabled();
  });

  it('shows tracked products count when products exist', () => {
    render(<BriefingGenerator />);
    expect(screen.getByText(/1 tracked product available/)).toBeInTheDocument();
  });

  it('shows fallback briefing when API fails', async () => {
    // Stub a fake API key so the code path reaches fetch (which we mock to reject)
    const original = import.meta.env.VITE_CLAUDE_API_KEY;
    import.meta.env.VITE_CLAUDE_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<BriefingGenerator />);

    const input = screen.getByLabelText('Briefing Topic');
    fireEvent.change(input, { target: { value: 'Antibiotics' } });

    const button = screen.getByRole('button', { name: /generate briefing/i });
    fireEvent.click(button);

    // Wait for the fallback briefing to appear
    const title = await screen.findByText('Intelligence Briefing: Antibiotics');
    expect(title).toBeInTheDocument();

    expect(
      await screen.findByText(/AI generation failed. Showing sample briefing/),
    ).toBeInTheDocument();

    // Restore env
    import.meta.env.VITE_CLAUDE_API_KEY = original;
  });

  it('shows fallback briefing when no API key is configured', async () => {
    render(<BriefingGenerator />);

    const input = screen.getByLabelText('Briefing Topic');
    fireEvent.change(input, { target: { value: 'Oncology' } });

    const select = screen.getByLabelText('Target Audience') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Executive' } });

    const button = screen.getByRole('button', { name: /generate briefing/i });
    fireEvent.click(button);

    // Since no API key is set in test environment, fallback fires
    const title = await screen.findByText('Intelligence Briefing: Oncology');
    expect(title).toBeInTheDocument();
  });
});
