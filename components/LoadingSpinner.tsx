import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string; // Tailwind color class e.g. "text-sky-400"
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, color = 'text-sky-400' }) => {
  return (
    <svg
      className={`animate-spin ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default LoadingSpinner;