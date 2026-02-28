import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { DrugProduct, ProductCategory } from '@/types';
import { computeProductRiskScore } from './RiskAnalyzer';

interface RiskHeatmapProps {
  products: DrugProduct[];
}

interface TreemapNode {
  [key: string]: string | number;
  name: string;
  category: ProductCategory;
  size: number;
  avgRisk: number;
  count: number;
  fill: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  analgesic: 'Analgesic',
  antibiotic: 'Antibiotic',
  antiviral: 'Antiviral',
  antifungal: 'Antifungal',
  cardiovascular: 'Cardiovascular',
  dermatological: 'Dermatological',
  endocrine: 'Endocrine',
  gastrointestinal: 'Gastrointestinal',
  immunological: 'Immunological',
  neurological: 'Neurological',
  oncological: 'Oncological',
  ophthalmic: 'Ophthalmic',
  psychiatric: 'Psychiatric',
  respiratory: 'Respiratory',
  musculoskeletal: 'Musculoskeletal',
  other: 'Other',
};

function riskToColor(avgRisk: number): string {
  if (avgRisk >= 60) return '#C0392B';
  if (avgRisk >= 40) return '#E67E22';
  if (avgRisk >= 20) return '#D4AC0D';
  return '#27AE60';
}

function buildTreemapData(products: DrugProduct[]): TreemapNode[] {
  const grouped = new Map<ProductCategory, { total: number; count: number }>();

  for (const p of products) {
    const entry = grouped.get(p.category) ?? { total: 0, count: 0 };
    entry.total += computeProductRiskScore(p);
    entry.count += 1;
    grouped.set(p.category, entry);
  }

  const nodes: TreemapNode[] = [];
  for (const [category, { total, count }] of grouped) {
    const avgRisk = Math.round(total / count);
    nodes.push({
      name: CATEGORY_LABELS[category],
      category,
      size: count,
      avgRisk,
      count,
      fill: riskToColor(avgRisk),
    });
  }

  return nodes.sort((a, b) => b.avgRisk - a.avgRisk);
}

interface CustomContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  avgRisk: number;
  count: number;
  fill: string;
}

const CustomTreemapContent = (props: CustomContentProps) => {
  const { x, y, width, height, name, avgRisk, count, fill } = props;

  if (width < 30 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize={Math.min(14, width / 8)}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize={Math.min(11, width / 10)}
            fontWeight={400}
            fillOpacity={0.8}
          >
            Risk: {avgRisk} | {count} product{count !== 1 ? 's' : ''}
          </text>
        </>
      )}
    </g>
  );
};

interface TooltipPayloadEntry {
  payload: TreemapNode;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-navy/10 bg-white px-4 py-3 shadow-lg">
      <p className="font-semibold text-navy">{data.name}</p>
      <p className="text-sm text-navy/70">
        Avg Risk Score: <span className="font-medium">{data.avgRisk}</span>
      </p>
      <p className="text-sm text-navy/70">
        Products: <span className="font-medium">{data.count}</span>
      </p>
    </div>
  );
};

const RiskHeatmap = ({ products }: RiskHeatmapProps) => {
  const data = useMemo(() => buildTreemapData(products), [products]);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-navy/50">
        No product data to display.
      </p>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={360}>
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          content={<CustomTreemapContent x={0} y={0} width={0} height={0} name="" avgRisk={0} count={0} fill="" />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-navy/60">
        <span className="font-medium text-navy/80">Risk Scale:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#27AE60]" />
          Low (&lt;20)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#D4AC0D]" />
          Moderate (20-39)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#E67E22]" />
          High (40-59)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#C0392B]" />
          Critical (60+)
        </span>
      </div>
    </div>
  );
};

export default RiskHeatmap;
