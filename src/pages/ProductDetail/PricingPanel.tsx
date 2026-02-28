import { Card } from '@/components/ui';

interface PricingPanelProps {
  awp: number | null;
  wac: number | null;
  fss: number | null;
  currency?: string;
  className?: string;
}

const formatPrice = (value: number | null, currency: string): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const pricingRows: { key: keyof Pick<PricingPanelProps, 'awp' | 'wac' | 'fss'>; label: string; description: string }[] = [
  { key: 'awp', label: 'AWP', description: 'Average Wholesale Price' },
  { key: 'wac', label: 'WAC', description: 'Wholesale Acquisition Cost' },
  { key: 'fss', label: 'FSS', description: 'Federal Supply Schedule' },
];

const PricingPanel = ({
  awp,
  wac,
  fss,
  currency = 'USD',
  className = '',
}: PricingPanelProps) => {
  const prices = { awp, wac, fss };

  return (
    <Card className={className}>
      <h2 className="mb-4 text-lg font-semibold text-navy">Pricing</h2>
      <div className="overflow-hidden rounded-lg border border-navy/10" data-testid="pricing-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/10 bg-offWhite">
              <th className="px-4 py-2.5 text-left font-medium text-navy/70">Type</th>
              <th className="px-4 py-2.5 text-left font-medium text-navy/70">Description</th>
              <th className="px-4 py-2.5 text-right font-medium text-navy/70">Price</th>
            </tr>
          </thead>
          <tbody>
            {pricingRows.map((row) => {
              const value = prices[row.key];
              const isNA = value === null || value === undefined;
              return (
                <tr key={row.key} className="border-b border-navy/5 last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-navy">{row.label}</td>
                  <td className="px-4 py-3 text-navy/60">{row.description}</td>
                  <td className={`px-4 py-3 text-right font-mono ${isNA ? 'text-navy/40' : 'text-navy font-semibold'}`}>
                    {formatPrice(value, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PricingPanel;
