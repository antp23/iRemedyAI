import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DrugProduct, RiskLevel, MIAScore, COORScore, QRScore, PNScore } from '@/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useProducts: vi.fn(),
  useScoring: vi.fn(),
}));

// Mock scoring service
vi.mock('@/services/scoring', () => ({
  isBAAEligible: vi.fn(),
}));

import { useProducts, useScoring } from '@/hooks';
import { isBAAEligible } from '@/services/scoring';
import ProductList from '../ProductList';

function makeProduct(overrides: Partial<DrugProduct> & { apiCountry?: string; fgCountry?: string } = {}): DrugProduct & { apiCountry: string; fgCountry: string } {
  return {
    id: crypto.randomUUID(),
    ndc: '0000-0000-00',
    name: 'Test Drug',
    brandName: 'TestBrand',
    genericName: 'testgeneric',
    labelerName: 'TestLab',
    manufacturer: 'USA Labs',
    productType: 'prescription',
    category: 'analgesic',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'tablet',
    strength: '100',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'bottle',
    description: 'A test drug product',
    activeIngredients: [],
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
    price: 10,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    apiCountry: 'US',
    fgCountry: 'US',
    ...overrides,
  };
}

function makeMIAScore(overallScore: number, riskLevel: RiskLevel = 'low'): MIAScore {
  return {
    id: 'mia-test',
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    riskLevel,
    recommendation: '',
    assessedAt: new Date().toISOString(),
  };
}

function makeCOORScore(overallScore: number = 80): COORScore {
  return {
    id: 'coors-test',
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    coordinationLevel: 'optimal',
    gaps: [],
    assessedAt: new Date().toISOString(),
  };
}

function makeQRScore(overallScore: number = 80): QRScore {
  return {
    id: 'qrs-test',
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    qualityRating: 'good',
    benchmarkComparison: { nationalAverage: 72, percentileRank: 80, trendDirection: 'stable' },
    assessedAt: new Date().toISOString(),
  };
}

function makePNScore(overallScore: number = 80): PNScore {
  return {
    id: 'pns-test',
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    needsLevel: 'minimal',
    prioritizedNeeds: [],
    assessedAt: new Date().toISOString(),
  };
}

function setupMocks(products: DrugProduct[]) {
  vi.mocked(useProducts).mockReturnValue({
    products,
    addProduct: vi.fn(),
    removeProduct: vi.fn(),
    getById: vi.fn(),
    baaEligible: [],
    highRisk: [],
    averageMIA: 0,
    productsByCountry: new Map(),
  });

  // Sequential call tracking for per-product scores
  const miaScores = products.map((p) => {
    const entry = miaScoreByProduct.get(p.name);
    return entry ?? 75;
  });
  const riskLevels = products.map((p) => {
    return riskByProduct.get(p.name) ?? ('low' as RiskLevel);
  });

  let miaCallIndex = 0;
  const calcMIA = vi.fn().mockImplementation(() => {
    const score = miaScores[miaCallIndex] ?? 75;
    miaCallIndex++;
    return makeMIAScore(score);
  });

  const calcCOORS = vi.fn().mockReturnValue(makeCOORScore());
  const calcQRS = vi.fn().mockReturnValue(makeQRScore());
  const calcPNS = vi.fn().mockReturnValue(makePNScore());

  let riskCallIndex = 0;
  const calcRisk = vi.fn().mockImplementation(() => {
    const risk = riskLevels[riskCallIndex] ?? 'low';
    riskCallIndex++;
    return risk;
  });

  vi.mocked(useScoring).mockReturnValue({
    products,
    calculateMIA: calcMIA,
    calculateCOORS: calcCOORS,
    calculateQRS: calcQRS,
    calculatePNS: calcPNS,
    calculateOverallRisk: calcRisk,
  });

  // BAA mock based on product name
  vi.mocked(isBAAEligible).mockImplementation((_score: number, fgCountry: string) => {
    return fgCountry === 'US';
  });
}

// Per-product score overrides
let miaScoreByProduct: Map<string, number>;
let riskByProduct: Map<string, RiskLevel>;

describe('ProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    miaScoreByProduct = new Map();
    riskByProduct = new Map();
  });

  describe('renders list of products', () => {
    it('shows empty state when no products', () => {
      setupMocks([]);
      render(<ProductList />);
      expect(screen.getByTestId('product-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No products tracked yet')).toBeInTheDocument();
    });

    it('renders product cards for each product', () => {
      const products = [
        makeProduct({ id: 'p1', name: 'Lisinopril 10mg' }),
        makeProduct({ id: 'p2', name: 'Metformin 500mg' }),
        makeProduct({ id: 'p3', name: 'Amoxicillin 500mg' }),
      ];
      setupMocks(products);
      render(<ProductList />);

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
      const cards = screen.getAllByTestId('product-card');
      expect(cards).toHaveLength(3);
    });

    it('renders 30+ products without issues', () => {
      const products = Array.from({ length: 35 }, (_, i) =>
        makeProduct({ id: `p${i}`, name: `Drug ${String(i).padStart(2, '0')}` }),
      );
      setupMocks(products);
      render(<ProductList />);

      const cards = screen.getAllByTestId('product-card');
      expect(cards).toHaveLength(35);
      expect(screen.getByTestId('product-list-scroll')).toBeInTheDocument();
    });

    it('displays product count', () => {
      const products = [
        makeProduct({ id: 'p1', name: 'Drug A' }),
        makeProduct({ id: 'p2', name: 'Drug B' }),
      ];
      setupMocks(products);
      render(<ProductList />);

      expect(screen.getByTestId('product-count')).toHaveTextContent('2 of 2 products');
    });

    it('navigates to product detail on click', () => {
      const products = [makeProduct({ id: 'test-123', name: 'Lisinopril' })];
      setupMocks(products);
      render(<ProductList />);

      fireEvent.click(screen.getByTestId('product-card'));
      expect(mockNavigate).toHaveBeenCalledWith('/product/test-123');
    });
  });

  describe('filters reduce displayed count', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'Lisinopril 10mg', category: 'cardiovascular', apiCountry: 'US', fgCountry: 'US' }),
      makeProduct({ id: 'p2', name: 'Metformin 500mg', category: 'endocrine', apiCountry: 'India', fgCountry: 'India' }),
      makeProduct({ id: 'p3', name: 'Ciprofloxacin 500mg', category: 'antibiotic', apiCountry: 'India', fgCountry: 'India' }),
      makeProduct({ id: 'p4', name: 'Ibuprofen 200mg', category: 'analgesic', apiCountry: 'China', fgCountry: 'China' }),
    ];

    beforeEach(() => {
      // Assign different risk levels per product
      riskByProduct.set('Lisinopril 10mg', 'low');
      riskByProduct.set('Metformin 500mg', 'moderate');
      riskByProduct.set('Ciprofloxacin 500mg', 'high');
      riskByProduct.set('Ibuprofen 200mg', 'critical');

      miaScoreByProduct.set('Lisinopril 10mg', 92);
      miaScoreByProduct.set('Metformin 500mg', 30);
      miaScoreByProduct.set('Ciprofloxacin 500mg', 30);
      miaScoreByProduct.set('Ibuprofen 200mg', 0);

      setupMocks(products);
    });

    it('filters by search text', () => {
      render(<ProductList />);
      expect(screen.getAllByTestId('product-card')).toHaveLength(4);

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'lisinopril' } });
      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
      expect(screen.getByTestId('product-count')).toHaveTextContent('1 of 4');
    });

    it('filters by risk level', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('filter-risk'), { target: { value: 'critical' } });
      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    });

    it('filters by BAA eligibility', () => {
      render(<ProductList />);

      // US products are BAA eligible, non-US are not
      fireEvent.change(screen.getByTestId('filter-baa'), { target: { value: 'eligible' } });
      expect(screen.getAllByTestId('product-card')).toHaveLength(1); // Only US product
    });

    it('filters by API source country', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('filter-country'), { target: { value: 'India' } });
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });

    it('filters by therapeutic class', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('filter-class'), { target: { value: 'cardiovascular' } });
      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    });

    it('combines filters (risk + country)', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('filter-country'), { target: { value: 'India' } });
      fireEvent.change(screen.getByTestId('filter-risk'), { target: { value: 'moderate' } });

      expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    });

    it('shows no-results message when filters exclude all', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'nonexistent' } });
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      expect(screen.getByText('No products match the current filters')).toBeInTheDocument();
    });
  });

  describe('sort changes order', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'Ciprofloxacin 500mg', apiCountry: 'India', fgCountry: 'India' }),
      makeProduct({ id: 'p2', name: 'Amoxicillin 500mg', apiCountry: 'US', fgCountry: 'US' }),
      makeProduct({ id: 'p3', name: 'Zoloft 50mg', apiCountry: 'China', fgCountry: 'China' }),
    ];

    beforeEach(() => {
      miaScoreByProduct.set('Ciprofloxacin 500mg', 30);
      miaScoreByProduct.set('Amoxicillin 500mg', 92);
      miaScoreByProduct.set('Zoloft 50mg', 0);

      riskByProduct.set('Ciprofloxacin 500mg', 'high');
      riskByProduct.set('Amoxicillin 500mg', 'low');
      riskByProduct.set('Zoloft 50mg', 'critical');

      setupMocks(products);
    });

    it('sorts by name ascending by default', () => {
      render(<ProductList />);

      const cards = screen.getAllByTestId('product-card');
      expect(cards[0]).toHaveTextContent('Amoxicillin 500mg');
      expect(cards[1]).toHaveTextContent('Ciprofloxacin 500mg');
      expect(cards[2]).toHaveTextContent('Zoloft 50mg');
    });

    it('sorts by name descending', () => {
      render(<ProductList />);

      fireEvent.click(screen.getByTestId('sort-order'));

      const cards = screen.getAllByTestId('product-card');
      expect(cards[0]).toHaveTextContent('Zoloft 50mg');
      expect(cards[2]).toHaveTextContent('Amoxicillin 500mg');
    });

    it('sorts by MIA score', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('sort-field'), { target: { value: 'miaScore' } });

      const cards = screen.getAllByTestId('product-card');
      // Ascending: 0 (Zoloft), 30 (Cipro), 92 (Amox)
      expect(cards[0]).toHaveTextContent('Zoloft 50mg');
      expect(cards[1]).toHaveTextContent('Ciprofloxacin 500mg');
      expect(cards[2]).toHaveTextContent('Amoxicillin 500mg');
    });

    it('sorts by risk level', () => {
      render(<ProductList />);

      fireEvent.change(screen.getByTestId('sort-field'), { target: { value: 'riskLevel' } });

      const cards = screen.getAllByTestId('product-card');
      // Ascending: low (Amox), high (Cipro), critical (Zoloft)
      expect(cards[0]).toHaveTextContent('Amoxicillin 500mg');
      expect(cards[1]).toHaveTextContent('Ciprofloxacin 500mg');
      expect(cards[2]).toHaveTextContent('Zoloft 50mg');
    });
  });
});
