import type { RiskLevel } from '@/types';

export interface SupplyChainNode {
  country: string;
  countryCode: string;
  role: 'api-manufacturer' | 'finished-goods' | 'distributor';
  riskLevel: RiskLevel;
}

interface SupplyChainMapProps {
  nodes: SupplyChainNode[];
  className?: string;
}

// Equirectangular projection: x = (lon+180)*(960/360), y = (90-lat)*(480/180)
const countryCoords: Record<string, [number, number]> = {
  US: [219, 136],
  CN: [757, 147],
  IN: [691, 184],
  DE: [507, 104],
  FR: [485, 115],
  GB: [472, 96],
  IT: [512, 125],
  ES: [469, 133],
  JP: [848, 144],
  KR: [821, 144],
  TW: [803, 176],
  BR: [341, 277],
  MX: [208, 179],
  CA: [224, 91],
  CH: [501, 115],
  IE: [459, 99],
  IL: [543, 157],
  PK: [667, 160],
  BD: [720, 176],
  AU: [808, 307],
  SG: [730, 227],
  SE: [515, 76],
  NL: [493, 98],
  BE: [490, 106],
};

const riskFill: Record<RiskLevel, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const roleLabels: Record<string, string> = {
  'api-manufacturer': 'API Mfg',
  'finished-goods': 'Finished Goods',
  distributor: 'Distributor/HQ',
};

const roleColors: Record<string, string> = {
  'api-manufacturer': '#3b82f6',
  'finished-goods': '#8b5cf6',
  distributor: '#C9A227',
};

// Simplified continent outlines (polygon points for equirectangular 960x480)
const continents = [
  // North America
  'M130,65 L280,55 L310,80 L310,110 L295,125 L265,175 L230,185 L200,195 L185,185 L145,175 L130,135 Z',
  // South America
  'M245,210 L290,200 L330,225 L345,265 L340,310 L320,350 L290,380 L265,370 L240,330 L235,280 L240,240 Z',
  // Europe
  'M445,60 L530,55 L560,75 L555,105 L530,125 L510,140 L475,140 L455,120 L445,100 Z',
  // Africa
  'M445,155 L510,145 L545,165 L555,200 L545,260 L520,310 L490,340 L460,330 L440,290 L430,240 L435,195 Z',
  // Asia
  'M555,55 L700,45 L790,55 L860,80 L870,120 L850,155 L800,180 L730,190 L680,175 L630,155 L580,140 L555,105 Z',
  // India subcontinent
  'M650,145 L700,140 L740,165 L720,210 L690,225 L660,200 L650,170 Z',
  // Oceania / Australia
  'M770,280 L830,270 L860,290 L855,320 L820,340 L775,330 L760,305 Z',
];

const SupplyChainMap = ({ nodes, className = '' }: SupplyChainMapProps) => {
  const resolvedNodes = nodes.map((node) => ({
    ...node,
    coords: countryCoords[node.countryCode] ?? [480, 240],
  }));

  // Sort by supply chain order for connecting lines
  const roleOrder = ['api-manufacturer', 'finished-goods', 'distributor'];
  const sorted = [...resolvedNodes].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border border-navy/10 bg-[#0f172a] ${className}`}
      data-testid="supply-chain-map"
    >
      <svg viewBox="0 0 960 480" className="w-full" role="img" aria-label="Supply chain world map">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#C9A227" opacity="0.8" />
          </marker>
        </defs>

        {/* Continent outlines */}
        {continents.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.5"
          />
        ))}

        {/* Country highlights based on risk level */}
        {resolvedNodes.map((node) => (
          <circle
            key={`area-${node.countryCode}`}
            cx={node.coords[0]}
            cy={node.coords[1]}
            r={20}
            fill={riskFill[node.riskLevel]}
            opacity={0.15}
          />
        ))}

        {/* Connecting lines between nodes */}
        {sorted.map((node, i) => {
          if (i === 0) return null;
          const prev = sorted[i - 1];
          return (
            <line
              key={`line-${prev.countryCode}-${node.countryCode}`}
              x1={prev.coords[0]}
              y1={prev.coords[1]}
              x2={node.coords[0]}
              y2={node.coords[1]}
              stroke="#C9A227"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Node markers */}
        {resolvedNodes.map((node) => (
          <g key={node.countryCode}>
            {/* Outer ring colored by risk */}
            <circle
              cx={node.coords[0]}
              cy={node.coords[1]}
              r={10}
              fill="none"
              stroke={riskFill[node.riskLevel]}
              strokeWidth="2"
            />
            {/* Inner dot colored by role */}
            <circle
              cx={node.coords[0]}
              cy={node.coords[1]}
              r={5}
              fill={roleColors[node.role]}
            />
            {/* Country label */}
            <text
              x={node.coords[0]}
              y={node.coords[1] - 16}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#e2e8f0"
            >
              {node.country}
            </text>
            {/* Role label */}
            <text
              x={node.coords[0]}
              y={node.coords[1] + 22}
              textAnchor="middle"
              fontSize="8"
              fill={roleColors[node.role]}
            >
              {roleLabels[node.role]}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Roles:</span>
          {Object.entries(roleLabels).map(([role, label]) => (
            <span key={role} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: roleColors[role] }}
              />
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Risk:</span>
          {(['low', 'moderate', 'high', 'critical'] as RiskLevel[]).map(
            (level) => (
              <span key={level} className="flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: riskFill[level] }}
                />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyChainMap;
