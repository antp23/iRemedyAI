interface GradientDividerProps {
  className?: string;
}

const GradientDivider = ({ className = '' }: GradientDividerProps) => {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{
        background:
          'linear-gradient(90deg, #0A1628 0%, #C9A227 50%, #0A1628 100%)',
      }}
      role="separator"
    />
  );
};

export default GradientDivider;
