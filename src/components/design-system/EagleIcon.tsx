interface EagleIconProps {
  size?: number;
  className?: string;
}

const EagleIcon = ({ size = 48, className = '' }: EagleIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Eagle icon"
      role="img"
    >
      {/* Head */}
      <path
        d="M32 8C34 8 37 10 38 13C39 16 38 18 36 19L32 22L28 19C26 18 25 16 26 13C27 10 30 8 32 8Z"
        fill="currentColor"
      />
      {/* Beak */}
      <path
        d="M32 22L30 26L32 28L34 26L32 22Z"
        fill="#C9A227"
      />
      {/* Body */}
      <path
        d="M32 28C28 28 24 32 24 38C24 44 28 48 32 48C36 48 40 44 40 38C40 32 36 28 32 28Z"
        fill="currentColor"
      />
      {/* Left wing */}
      <path
        d="M24 32C20 28 14 26 8 28C6 29 4 32 6 34C8 36 12 37 16 36C20 35 23 34 24 32Z"
        fill="currentColor"
        opacity={0.9}
      />
      {/* Right wing */}
      <path
        d="M40 32C44 28 50 26 56 28C58 29 60 32 58 34C56 36 52 37 48 36C44 35 41 34 40 32Z"
        fill="currentColor"
        opacity={0.9}
      />
      {/* Tail feathers */}
      <path
        d="M28 48L26 56L30 54L32 58L34 54L38 56L36 48"
        fill="currentColor"
        opacity={0.8}
      />
      {/* Eye left */}
      <circle cx="30" cy="14" r="1.5" fill="#C9A227" />
      {/* Eye right */}
      <circle cx="34" cy="14" r="1.5" fill="#C9A227" />
    </svg>
  );
};

export default EagleIcon;
