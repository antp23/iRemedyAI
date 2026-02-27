import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-navy/10 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
