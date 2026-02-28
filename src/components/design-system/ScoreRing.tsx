import { useEffect, useRef, useState } from 'react';

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: number;
  className?: string;
}

const ScoreRing = ({
  score,
  label,
  size = 120,
  className = '',
}: ScoreRingProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animationRef = useRef<number>();
  const clampedScore = Math.max(0, Math.min(100, score));

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedScore(Math.round(eased * clampedScore));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [clampedScore]);

  const gradientId = `score-ring-gradient-${label ?? 'default'}`;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 ${className}`}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${clampedScore}%` : `${clampedScore}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0A1628"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-navy font-heading font-bold"
          style={{ fontSize: size * 0.25 }}
        >
          {animatedScore}
        </text>
      </svg>
      {label && (
        <span className="text-sm font-medium text-navy/70">{label}</span>
      )}
    </div>
  );
};

export default ScoreRing;
