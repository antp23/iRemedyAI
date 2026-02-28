import styles from './RotatingGlobe.module.css';

interface RotatingGlobeProps {
  size?: number;
  className?: string;
}

const RotatingGlobe = ({ size = 200, className = '' }: RotatingGlobeProps) => {
  const center = size / 2;
  const radius = size * 0.4;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
      data-testid="rotating-globe"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer glow ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 8}
          fill="none"
          stroke="#C9A227"
          strokeWidth={1}
          className={styles.ring}
        />

        {/* Main globe circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#0A1628"
          strokeWidth={2}
          opacity={0.3}
        />

        {/* Rotating meridians group */}
        <g className={styles.globe} style={{ transformOrigin: `${center}px ${center}px` }}>
          {/* Vertical meridian */}
          <ellipse
            cx={center}
            cy={center}
            rx={radius * 0.3}
            ry={radius}
            fill="none"
            stroke="#0A1628"
            strokeWidth={1.5}
            opacity={0.2}
          />
          {/* Tilted meridian */}
          <ellipse
            cx={center}
            cy={center}
            rx={radius * 0.7}
            ry={radius}
            fill="none"
            stroke="#0A1628"
            strokeWidth={1.5}
            opacity={0.15}
          />
          {/* Horizontal latitude lines */}
          <ellipse
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 0.3}
            fill="none"
            stroke="#C9A227"
            strokeWidth={1}
            opacity={0.2}
          />
          <ellipse
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 0.6}
            fill="none"
            stroke="#C9A227"
            strokeWidth={1}
            opacity={0.15}
          />
        </g>

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={3}
          fill="#C9A227"
          opacity={0.5}
        />
      </svg>
    </div>
  );
};

export default RotatingGlobe;
