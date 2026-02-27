import styles from './FloatingPills.module.css';

interface FloatingPillsProps {
  count?: number;
  className?: string;
}

const pills = [
  { left: '5%', width: 12, height: 28, duration: 18, delay: 0, color: '#0A1628' },
  { left: '15%', width: 10, height: 24, duration: 22, delay: 3, color: '#C9A227' },
  { left: '25%', width: 14, height: 32, duration: 20, delay: 7, color: '#0A1628' },
  { left: '35%', width: 8, height: 20, duration: 25, delay: 2, color: '#C9A227' },
  { left: '45%', width: 11, height: 26, duration: 19, delay: 5, color: '#0A1628' },
  { left: '55%', width: 13, height: 30, duration: 23, delay: 8, color: '#C9A227' },
  { left: '65%', width: 9, height: 22, duration: 21, delay: 1, color: '#0A1628' },
  { left: '75%', width: 12, height: 28, duration: 17, delay: 6, color: '#C9A227' },
  { left: '85%', width: 10, height: 24, duration: 24, delay: 4, color: '#0A1628' },
  { left: '92%', width: 14, height: 32, duration: 20, delay: 9, color: '#C9A227' },
];

const FloatingPills = ({ count = 10, className = '' }: FloatingPillsProps) => {
  const visiblePills = pills.slice(0, Math.min(count, pills.length));

  return (
    <div
      className={`${styles.container} ${className}`}
      aria-hidden="true"
      data-testid="floating-pills"
    >
      {visiblePills.map((pill, i) => (
        <div
          key={i}
          className={styles.pill}
          style={{
            left: pill.left,
            width: pill.width,
            height: pill.height,
            backgroundColor: pill.color,
            animationDuration: `${pill.duration}s`,
            animationDelay: `${pill.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingPills;
