import { useState, useMemo } from 'react';
import type { ProductCategory } from '@/types';
import ComparisonTable from './ComparisonTable';
import type { ProcurementProduct } from './ComparisonTable';

const THERAPEUTIC_CLASSES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Therapeutic Classes' },
  { value: 'analgesic', label: 'Analgesic' },
  { value: 'antibiotic', label: 'Antibiotic' },
  { value: 'antiviral', label: 'Antiviral' },
  { value: 'antifungal', label: 'Antifungal' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'dermatological', label: 'Dermatological' },
  { value: 'endocrine', label: 'Endocrine' },
  { value: 'gastrointestinal', label: 'Gastrointestinal' },
  { value: 'immunological', label: 'Immunological' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'oncological', label: 'Oncological' },
  { value: 'ophthalmic', label: 'Ophthalmic' },
  { value: 'psychiatric', label: 'Psychiatric' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'musculoskeletal', label: 'Musculoskeletal' },
  { value: 'other', label: 'Other' },
];

// V1 mock procurement data — real API integration comes in V3 with MetaCommerceRx
const MOCK_PRODUCTS: ProcurementProduct[] = [
  {
    id: 'proc-1',
    name: 'Lisinopril 10mg',
    manufacturer: 'Lupin Pharmaceuticals',
    therapeuticClass: 'cardiovascular',
    miaScore: 88,
    coorsScore: 92,
    qrsScore: 85,
    baaEligible: true,
    awpPrice: 45.99,
    fssPrice: 32.5,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-2',
    name: 'Lisinopril 10mg',
    manufacturer: 'Teva Pharmaceutical',
    therapeuticClass: 'cardiovascular',
    miaScore: 82,
    coorsScore: 78,
    qrsScore: 80,
    baaEligible: false,
    awpPrice: 38.5,
    fssPrice: 27.0,
    riskLevel: 'moderate',
    sourceCountry: 'Israel',
  },
  {
    id: 'proc-3',
    name: 'Amlodipine 5mg',
    manufacturer: 'Pfizer Inc.',
    therapeuticClass: 'cardiovascular',
    miaScore: 95,
    coorsScore: 91,
    qrsScore: 93,
    baaEligible: true,
    awpPrice: 62.0,
    fssPrice: 44.8,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-4',
    name: 'Amlodipine 5mg',
    manufacturer: 'Cipla Ltd.',
    therapeuticClass: 'cardiovascular',
    miaScore: 70,
    coorsScore: 65,
    qrsScore: 68,
    baaEligible: false,
    awpPrice: 28.0,
    fssPrice: 19.5,
    riskLevel: 'high',
    sourceCountry: 'India',
  },
  {
    id: 'proc-5',
    name: 'Amoxicillin 500mg',
    manufacturer: 'Sandoz Inc.',
    therapeuticClass: 'antibiotic',
    miaScore: 90,
    coorsScore: 87,
    qrsScore: 88,
    baaEligible: true,
    awpPrice: 22.0,
    fssPrice: 15.6,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-6',
    name: 'Amoxicillin 500mg',
    manufacturer: 'Aurobindo Pharma',
    therapeuticClass: 'antibiotic',
    miaScore: 75,
    coorsScore: 70,
    qrsScore: 72,
    baaEligible: false,
    awpPrice: 14.0,
    fssPrice: 9.8,
    riskLevel: 'moderate',
    sourceCountry: 'India',
  },
  {
    id: 'proc-7',
    name: 'Azithromycin 250mg',
    manufacturer: 'Greenstone LLC',
    therapeuticClass: 'antibiotic',
    miaScore: 86,
    coorsScore: 84,
    qrsScore: 82,
    baaEligible: true,
    awpPrice: 55.0,
    fssPrice: 39.0,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-8',
    name: 'Omeprazole 20mg',
    manufacturer: 'Mylan N.V.',
    therapeuticClass: 'gastrointestinal',
    miaScore: 80,
    coorsScore: 76,
    qrsScore: 79,
    baaEligible: false,
    awpPrice: 35.0,
    fssPrice: 24.5,
    riskLevel: 'moderate',
    sourceCountry: 'Netherlands',
  },
  {
    id: 'proc-9',
    name: 'Omeprazole 20mg',
    manufacturer: 'Dr. Reddy\'s',
    therapeuticClass: 'gastrointestinal',
    miaScore: 72,
    coorsScore: 68,
    qrsScore: 70,
    baaEligible: false,
    awpPrice: 18.0,
    fssPrice: 12.6,
    riskLevel: 'high',
    sourceCountry: 'India',
  },
  {
    id: 'proc-10',
    name: 'Omeprazole 20mg',
    manufacturer: 'Perrigo Company',
    therapeuticClass: 'gastrointestinal',
    miaScore: 84,
    coorsScore: 82,
    qrsScore: 81,
    baaEligible: true,
    awpPrice: 42.0,
    fssPrice: 30.0,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-11',
    name: 'Sertraline 50mg',
    manufacturer: 'Accord Healthcare',
    therapeuticClass: 'psychiatric',
    miaScore: 78,
    coorsScore: 74,
    qrsScore: 76,
    baaEligible: true,
    awpPrice: 30.0,
    fssPrice: 21.0,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-12',
    name: 'Sertraline 50mg',
    manufacturer: 'Sun Pharmaceutical',
    therapeuticClass: 'psychiatric',
    miaScore: 68,
    coorsScore: 62,
    qrsScore: 65,
    baaEligible: false,
    awpPrice: 16.0,
    fssPrice: 11.2,
    riskLevel: 'moderate',
    sourceCountry: 'India',
  },
  {
    id: 'proc-13',
    name: 'Ibuprofen 400mg',
    manufacturer: 'Amneal Pharmaceuticals',
    therapeuticClass: 'analgesic',
    miaScore: 91,
    coorsScore: 88,
    qrsScore: 90,
    baaEligible: true,
    awpPrice: 12.0,
    fssPrice: 8.4,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-14',
    name: 'Ibuprofen 400mg',
    manufacturer: 'Stada Arzneimittel',
    therapeuticClass: 'analgesic',
    miaScore: 77,
    coorsScore: 73,
    qrsScore: 75,
    baaEligible: false,
    awpPrice: 8.5,
    fssPrice: 6.0,
    riskLevel: 'moderate',
    sourceCountry: 'Germany',
  },
  {
    id: 'proc-15',
    name: 'Metformin 500mg',
    manufacturer: 'Heritage Pharmaceuticals',
    therapeuticClass: 'endocrine',
    miaScore: 85,
    coorsScore: 83,
    qrsScore: 81,
    baaEligible: true,
    awpPrice: 20.0,
    fssPrice: 14.0,
    riskLevel: 'low',
    sourceCountry: 'United States',
  },
  {
    id: 'proc-16',
    name: 'Metformin 500mg',
    manufacturer: 'Zydus Lifesciences',
    therapeuticClass: 'endocrine',
    miaScore: 71,
    coorsScore: 66,
    qrsScore: 69,
    baaEligible: false,
    awpPrice: 10.0,
    fssPrice: 7.0,
    riskLevel: 'high',
    sourceCountry: 'India',
  },
];

const Procurement = () => {
  const [selectedClass, setSelectedClass] = useState<ProductCategory | 'all'>('all');
  const [baaOnly, setBaaOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = MOCK_PRODUCTS;
    if (selectedClass !== 'all') {
      result = result.filter((p) => p.therapeuticClass === selectedClass);
    }
    if (baaOnly) {
      result = result.filter((p) => p.baaEligible);
    }
    return result;
  }, [selectedClass, baaOnly]);

  const classProductCount = useMemo(() => {
    const base = baaOnly ? MOCK_PRODUCTS.filter((p) => p.baaEligible) : MOCK_PRODUCTS;
    if (selectedClass === 'all') return base.length;
    return base.filter((p) => p.therapeuticClass === selectedClass).length;
  }, [selectedClass, baaOnly]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-navy">
          Procurement Comparison
        </h1>
        <p className="mt-2 text-navy/70">
          Compare therapeutically equivalent products side-by-side. Ranked by
          compliance scores and pricing intelligence.
        </p>
        <p className="mt-1 text-xs text-navy/40">
          V1 — Display &amp; compare only. Purchase integration with
          MetaCommerceRx available in V3.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-6">
        {/* Therapeutic class filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="therapeutic-class"
            className="text-sm font-medium text-navy"
          >
            Therapeutic Class
          </label>
          <select
            id="therapeutic-class"
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value as ProductCategory | 'all')
            }
            className="rounded-lg border border-navy/20 bg-white px-4 py-2 text-navy transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            data-testid="class-filter"
          >
            {THERAPEUTIC_CLASSES.map((tc) => (
              <option key={tc.value} value={tc.value}>
                {tc.label}
              </option>
            ))}
          </select>
        </div>

        {/* BAA compliance toggle */}
        <label className="inline-flex cursor-pointer items-center gap-3">
          <span className="text-sm font-medium text-navy">
            Buy American Act Only
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={baaOnly}
            onClick={() => setBaaOnly((v) => !v)}
            data-testid="baa-toggle"
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
              baaOnly ? 'bg-gold' : 'bg-navy/20'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                baaOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>

        {/* Result count */}
        <span className="text-sm text-navy/60">
          {classProductCount} product{classProductCount !== 1 ? 's' : ''} found
        </span>
      </div>

      <ComparisonTable products={filtered} />
    </div>
  );
};

export default Procurement;
