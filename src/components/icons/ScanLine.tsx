
import React from 'react';

interface ScanLineProps {
  size?: number;
  className?: string;
}

const ScanLine: React.FC<ScanLineProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height="2"
      viewBox="0 0 240 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line x1="0" y1="1" x2="240" y2="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export default ScanLine;
