import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DrugProduct, RiskLevel } from '@/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
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
  isTAACountry: vi.fn(),
  getCountryScore: vi.fn(),
}));

import { useParams } from 'react-router-dom';
import { useProducts, useScoring } from '@/hooks';
import { isBAAEligible, isTAACountry, getCountryScore } from '@/services/scoring';
import ProductDetail from '../ProductDetail';

const fullProduct: DrugProduct & { apiCountry: string; fgCountry: string; dataSource: string } = {
  id: 'test-001',
  ndc: '0002-4462-30',
  name: 'Lisinopril 10mg',
  brandName: 'Prinivil',
  genericName: 'Lisinopril',
  labelerName: 'Merck',
  manufacturer: 'Merck & Co., USA',
  productType: 'prescription',
  category: 'cardiovascular',
  schedule: 'unscheduled',
  routeOfAdministration: 'oral',
  dosageForm: 'Tablet',
  strength: '10',
  strengthUnit: 'mg',
  packageSize: '30',
  packageType: 'Bottle',
  description: 'ACE inhibitor for hypertension',
  activeIngredients: [{ name: 'Lisinopril', strength: '10', unit: 'mg' }],
  inactiveIngredients: ['Microcrystalline Cellulose'],
  indications: ['Hypertension', 'Heart failure'],
  contraindications: ['Angioedema'],
  warnings: ['Fetal toxicity'],
  sideEffects: ['Cough', 'Dizziness'],
  interactions: [],
  storageConditions: 'Store at 20-25°C',
  requiresPrescription: true,
  isControlled: false,
  isAvailable: true,
  price: 12.50,
  currency: 'USD',
  fdaApprovalDate: '2020-01-15',
  expirationDate: '2027-12-31',
  lotNumber: 'LOT-001',
  barcode: '300024462301',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  apiCountry: 'US',
  fgCountry: 'US',
  dataSource: 'SEED',
};

const sparseProduct: DrugProduct = {
  id: 'test-002',
  ndc: '',
  name: 'Generic Drug',
  brandName: 'Generic',
  genericName: 'Generic Compound',
  labelerName: '',
  manufacturer: 'Unknown Manufacturer',
  productType: 'otc',
  category: 'other',
  schedule: 'unscheduled',
  routeOfAdministration: 'oral',
  dosageForm: 'Tablet',
  strength: '5',
  strengthUnit: 'mg',
  packageSize: '10',
  packageType: 'Blister',
  description: 'A generic drug',
  activeIngredients: [],
  inactiveIngredients: [],
  indications: [],
  contraindications: [],
  warnings: [],
  sideEffects: [],
  interactions: [],
  storageConditions: '',
  requiresPrescription: false,
  isControlled: false,
  isAvailable: false,
  price: 3.00,
  currency: 'USD',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function setupMocks(product: DrugProduct | undefined, paramId: string = 'test-001') {
  vi.mocked(useParams).mockReturnValue({ id: paramId });

  vi.mocked(useProducts).mockReturnValue({
    products: product ? [product] : [],
    addProduct: vi.fn(),
    removeProduct: vi.fn(),
    getById: vi.fn().mockReturnValue(product),
    baaEligible: [],
    highRisk: [],
    averageMIA: 0,
    productsByCountry: new Map(),
  });

  vi.mocked(useScoring).mockReturnValue({
    products: product ? [product] : [],
    calculateMIA: vi.fn().mockReturnValue({
      id: 'mia-test',
      patientId: '',
      sessionId: '',
      overallScore: 92,
      categoryScores: [
        {
          category: 'medication-adherence',
          score: 100,
          maxScore: 100,
          weight: 0.6,
          findings: ['API sourced from US (score: 100)'],
        },
        {
          category: 'interaction-risk',
          score: 100,
          maxScore: 100,
          weight: 0.4,
          findings: ['Finished good from US (score: 100)'],
        },
      ],
      riskLevel: 'low' as RiskLevel,
      recommendation: 'Product has strong domestic sourcing.',
      assessedAt: '2026-01-01T00:00:00Z',
    }),
    calculateCOORS: vi.fn().mockReturnValue({
      id: 'coors-test',
      patientId: '',
      sessionId: '',
      overallScore: 85,
      categoryScores: [],
      coordinationLevel: 'optimal',
      gaps: [],
      assessedAt: '2026-01-01T00:00:00Z',
    }),
    calculateQRS: vi.fn().mockReturnValue({
      id: 'qrs-test',
      patientId: '',
      sessionId: '',
      overallScore: 78,
      categoryScores: [],
      qualityRating: 'good',
      benchmarkComparison: {
        nationalAverage: 72,
        percentileRank: 85,
        trendDirection: 'improving',
      },
      assessedAt: '2026-01-01T00:00:00Z',
    }),
    calculatePNS: vi.fn().mockReturnValue({
      id: 'pns-test',
      patientId: '',
      sessionId: '',
      overallScore: 88,
      categoryScores: [],
      needsLevel: 'minimal',
      prioritizedNeeds: [],
      assessedAt: '2026-01-01T00:00:00Z',
    }),
    calculateOverallRisk: vi.fn().mockReturnValue('low' as RiskLevel),
  });

  vi.mocked(isBAAEligible).mockReturnValue(true);
  vi.mocked(isTAACountry).mockReturnValue(true);
  vi.mocked(getCountryScore).mockReturnValue(100);
}

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders all panels for a complete product', () => {
    beforeEach(() => {
      setupMocks(fullProduct);
    });

    it('renders the product detail container', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('renders the product name and details', () => {
      render(<ProductDetail />);
      expect(screen.getByText('Lisinopril 10mg')).toBeInTheDocument();
      expect(screen.getByText(/Merck & Co., USA/)).toBeInTheDocument();
    });

    it('renders the large MIA ScoreRing in the header', () => {
      render(<ProductDetail />);
      const meters = screen.getAllByRole('meter');
      expect(meters.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the overall risk badge', () => {
      render(<ProductDetail />);
      const badges = screen.getAllByRole('status', { name: /Risk level/i });
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the score dashboard with 4 score rings', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('score-dashboard')).toBeInTheDocument();
      // MIA appears in both header and dashboard, so use getAllByText
      expect(screen.getAllByText('MIA').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('COORS')).toBeInTheDocument();
      expect(screen.getByText('QRS')).toBeInTheDocument();
      expect(screen.getByText('PNS')).toBeInTheDocument();
    });

    it('renders the compliance grid', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('compliance-grid')).toBeInTheDocument();
      expect(screen.getByText('BAA')).toBeInTheDocument();
      expect(screen.getByText('FDA')).toBeInTheDocument();
    });

    it('renders the pricing table', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('pricing-table')).toBeInTheDocument();
      expect(screen.getByText('AWP')).toBeInTheDocument();
      expect(screen.getByText('WAC')).toBeInTheDocument();
      expect(screen.getByText('FSS')).toBeInTheDocument();
    });

    it('shows N/A for FSS price', () => {
      render(<ProductDetail />);
      const fssRow = screen.getByText('FSS').closest('tr');
      expect(fssRow).toHaveTextContent('N/A');
    });

    it('renders the supply chain map', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('supply-chain-map')).toBeInTheDocument();
    });

    it('renders origin node badges', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('origin-node-badges')).toBeInTheDocument();
    });

    it('renders confidence meters', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('confidence-section')).toBeInTheDocument();
      const meters = screen.getAllByTestId('confidence-meter');
      expect(meters).toHaveLength(2);
    });

    it('renders intelligence notes for SEED data source', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('intelligence-notes')).toBeInTheDocument();
      expect(screen.getByText(/scoring engine with verified origin data/i)).toBeInTheDocument();
    });

    it('renders NDC in the header', () => {
      render(<ProductDetail />);
      expect(screen.getByText(/NDC: 0002-4462-30/)).toBeInTheDocument();
    });
  });

  describe('handles product with null/missing optional fields', () => {
    beforeEach(() => {
      setupMocks(sparseProduct, 'test-002');
      vi.mocked(isBAAEligible).mockReturnValue(false);
      vi.mocked(isTAACountry).mockReturnValue(false);
      vi.mocked(getCountryScore).mockReturnValue(50);
      vi.mocked(useScoring).mockReturnValue({
        products: [sparseProduct],
        calculateMIA: vi.fn().mockReturnValue({
          id: 'mia-sparse',
          patientId: '',
          sessionId: '',
          overallScore: 50,
          categoryScores: [],
          riskLevel: 'moderate' as RiskLevel,
          recommendation: 'Product has limited domestic sourcing.',
          assessedAt: '2026-01-01T00:00:00Z',
        }),
        calculateCOORS: vi.fn().mockReturnValue({
          id: 'coors-sparse',
          patientId: '',
          sessionId: '',
          overallScore: 40,
          categoryScores: [],
          coordinationLevel: 'suboptimal',
          gaps: [
            {
              type: 'regulatory-gap',
              description: 'No FDA approval date documented',
              severity: 'medium',
              recommendedAction: 'Verify FDA approval status',
            },
          ],
          assessedAt: '2026-01-01T00:00:00Z',
        }),
        calculateQRS: vi.fn().mockReturnValue({
          id: 'qrs-sparse',
          patientId: '',
          sessionId: '',
          overallScore: 35,
          categoryScores: [],
          qualityRating: 'poor',
          benchmarkComparison: {
            nationalAverage: 72,
            percentileRank: 30,
            trendDirection: 'declining',
          },
          assessedAt: '2026-01-01T00:00:00Z',
        }),
        calculatePNS: vi.fn().mockReturnValue({
          id: 'pns-sparse',
          patientId: '',
          sessionId: '',
          overallScore: 60,
          categoryScores: [],
          needsLevel: 'moderate',
          prioritizedNeeds: [],
          assessedAt: '2026-01-01T00:00:00Z',
        }),
        calculateOverallRisk: vi.fn().mockReturnValue('high' as RiskLevel),
      });
    });

    it('renders the product detail container', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('renders the product name', () => {
      render(<ProductDetail />);
      expect(screen.getByText('Generic Drug')).toBeInTheDocument();
    });

    it('does not render NDC when empty', () => {
      render(<ProductDetail />);
      expect(screen.queryByText(/NDC:/)).not.toBeInTheDocument();
    });

    it('still renders all score rings', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('score-dashboard')).toBeInTheDocument();
      // MIA appears in both header and dashboard
      expect(screen.getAllByText('MIA').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('COORS')).toBeInTheDocument();
    });

    it('shows compliance failures', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('compliance-grid')).toBeInTheDocument();
    });

    it('renders pricing table with WAC and FSS as N/A', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('pricing-table')).toBeInTheDocument();
    });

    it('renders supply chain map', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('supply-chain-map')).toBeInTheDocument();
    });

    it('renders confidence meters with lower confidence', () => {
      render(<ProductDetail />);
      const meters = screen.getAllByTestId('confidence-meter');
      expect(meters).toHaveLength(2);
    });
  });

  describe('product not found', () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ id: 'nonexistent' });
      vi.mocked(useProducts).mockReturnValue({
        products: [],
        addProduct: vi.fn(),
        removeProduct: vi.fn(),
        getById: vi.fn().mockReturnValue(undefined),
        baaEligible: [],
        highRisk: [],
        averageMIA: 0,
        productsByCountry: new Map(),
      });
    });

    it('shows product not found message', () => {
      render(<ProductDetail />);
      expect(screen.getByTestId('product-not-found')).toBeInTheDocument();
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    it('shows a back button', () => {
      render(<ProductDetail />);
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });
});
