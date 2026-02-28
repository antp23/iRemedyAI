import type { DrugProduct } from '@/types';

interface ApiSourceChartProps {
  productsByCountry: Map<string, DrugProduct[]>;
}

interface ChartDataItem {
  name: string;
  count: number;
  color: string;
}

const RISK_COLORS: Record<string, string> = {
  USA: '#27AE60',
  India: '#E67E22',
  China: '#C0392B',
  Germany: '#2980B9',
  Ireland: '#27AE60',
  Japan: '#2980B9',
  Switzerland: '#27AE60',
  Canada: '#27AE60',
  Unknown: '#95A5A6',
};

function getColor(country: string): string {
  return RISK_COLORS[country] ?? '#8E44AD';
}

function buildChartData(
  productsByCountry: Map<string, DrugProduct[]>,
): ChartDataItem[] {
  const data: ChartDataItem[] = [];
  productsByCountry.forEach((products, country) => {
    data.push({
      name: country,
      count: products.length,
      color: getColor(country),
    });
  });
  return data.sort((a, b) => b.count - a.count);
}

/** Fallback HTML table when Recharts cannot render */
const FallbackTable = ({ data }: { data: ChartDataItem[] }) => (
  <div className="overflow-x-auto" data-testid="api-source-table">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-navy/10">
          <th className="py-2 font-semibold text-navy">Country</th>
          <th className="py-2 text-right font-semibold text-navy">Products</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.name} className="border-b border-navy/5">
            <td className="flex items-center gap-2 py-2 text-navy/80">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </td>
            <td className="py-2 text-right font-medium text-navy">
              {item.count}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Simple bar visualization using plain HTML/CSS */
const CountryBarChart = ({ data }: { data: ChartDataItem[] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="mt-4 space-y-2" data-testid="api-source-bars">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-sm text-navy/70">
            {item.name}
          </span>
          <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-navy/5">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-semibold text-navy">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
};

const ApiSourceChart = ({ productsByCountry }: ApiSourceChartProps) => {
  const data = buildChartData(productsByCountry);

  if (data.length === 0) {
    return (
      <div
        className="rounded-xl border border-navy/10 bg-white p-6 shadow-sm"
        data-testid="api-source-chart"
      >
        <h2 className="font-heading text-lg font-bold text-navy">
          API Source Country Distribution
        </h2>
        <p className="mt-4 text-center text-navy/50">
          No country data available
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-navy/10 bg-white p-6 shadow-sm"
      data-testid="api-source-chart"
    >
      <h2 className="font-heading text-lg font-bold text-navy">
        API Source Country Distribution
      </h2>
      <CountryBarChart data={data} />
      <div className="mt-4">
        <FallbackTable data={data} />
      </div>
    </div>
  );
};

export default ApiSourceChart;
