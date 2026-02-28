import type { ShortageRiskFactors } from './ShortageWarning';

interface ShortageRadarProps {
  factors: ShortageRiskFactors;
  productName: string;
  className?: string;
}

interface RadarAxis {
  label: string;
  shortLabel: string;
  value: number;
}

/** Map boolean risk factors to 0-100 radar values (higher = more risk). */
function factorsToAxes(factors: ShortageRiskFactors): RadarAxis[] {
  return [
    {
      label: 'Supply Availability',
      shortLabel: 'Avail.',
      value: factors.isUnavailable ? 100 : 0,
    },
    {
      label: 'Country Risk',
      shortLabel: 'Country',
      value: factors.highRiskCountry ? 100 : 0,
    },
    {
      label: 'Recall Indicators',
      shortLabel: 'Recall',
      value: factors.recentRecallRisk ? 100 : 0,
    },
    {
      label: 'Source Diversity',
      shortLabel: 'Source',
      value: factors.singleSource ? 100 : 0,
    },
    {
      label: 'Compliance Score',
      shortLabel: 'Compl.',
      value: factors.lowComplianceScore ? 100 : 0,
    },
  ];
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 90;
const RINGS = 4;

/** Convert polar coordinates to cartesian for radar layout. */
function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  // Start from top (-90deg) and go clockwise
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

const ShortageRadar = ({
  factors,
  productName,
  className = '',
}: ShortageRadarProps) => {
  const axes = factorsToAxes(factors);
  const angleStep = 360 / axes.length;

  // Build the data polygon path
  const dataPoints = axes.map((axis, i) => {
    const r = (axis.value / 100) * RADIUS;
    return polarToCartesian(i * angleStep, r);
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  const overallRisk = Math.round(
    axes.reduce((sum, a) => sum + a.value, 0) / axes.length,
  );

  const riskColor =
    overallRisk >= 60 ? '#C0392B' : overallRisk >= 40 ? '#E67E22' : overallRisk >= 20 ? '#D4AC0D' : '#27AE60';

  return (
    <div
      className={`rounded-xl border border-navy/10 bg-white p-5 ${className}`}
      data-testid="shortage-radar"
    >
      <h3 className="mb-1 font-heading text-sm font-semibold text-navy">
        Shortage Risk Radar
      </h3>
      <p className="mb-4 truncate text-xs text-navy/50">{productName}</p>

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto"
        role="img"
        aria-label={`Shortage risk radar for ${productName}: overall risk ${overallRisk}%`}
      >
        {/* Background rings */}
        {Array.from({ length: RINGS }, (_, i) => {
          const r = ((i + 1) / RINGS) * RADIUS;
          const points = axes
            .map((_, j) => {
              const pt = polarToCartesian(j * angleStep, r);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`ring-${i}`}
              points={points}
              fill="none"
              stroke="#0A1628"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const pt = polarToCartesian(i * angleStep, RADIUS);
          return (
            <line
              key={`axis-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={pt.x}
              y2={pt.y}
              stroke="#0A1628"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill={riskColor}
          fillOpacity={0.2}
          stroke={riskColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((pt, i) => (
          <circle
            key={`point-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill={axes[i].value > 0 ? riskColor : '#27AE60'}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const pt = polarToCartesian(i * angleStep, RADIUS + 18);
          return (
            <text
              key={`label-${i}`}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-navy/60"
              style={{ fontSize: 10 }}
            >
              {axis.shortLabel}
            </text>
          );
        })}

        {/* Center risk score */}
        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-navy font-heading font-bold"
          style={{ fontSize: 20 }}
        >
          {overallRisk}%
        </text>
        <text
          x={CENTER}
          y={CENTER + 12}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-navy/50"
          style={{ fontSize: 9 }}
        >
          Risk Score
        </text>
      </svg>

      {/* Factor breakdown */}
      <div className="mt-4 space-y-2">
        {axes.map((axis) => (
          <div key={axis.label} className="flex items-center justify-between text-xs">
            <span className="text-navy/70">{axis.label}</span>
            <span
              className={`font-medium ${
                axis.value > 0 ? 'text-[#C0392B]' : 'text-[#27AE60]'
              }`}
              data-testid="radar-factor-status"
            >
              {axis.value > 0 ? 'At Risk' : 'OK'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShortageRadar;
