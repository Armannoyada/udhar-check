interface UdhaarLogoProps {
  size?: number;
}

export function UdhaarLogo({ size = 128 }: UdhaarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded Square Background - Royal Blue with White Logo */}
      <rect
        width="300" 
        height="300"
        rx="28"
        fill="#4c43de"
      />
      
      {/* Main U Shape - Thick White */}
      <path
        d="M 36 40 L 36 75 C 36 90 46 100 64 100 C 82 100 92 90 92 75 L 92 40"
        stroke="white"
        strokeWidth= {200}
        fill="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Decorative dots above U */}
      <circle cx="40" cy="32" r="3" fill="white" opacity="0.8" />
      <circle cx="50" cy="28" r="2.5" fill="white" opacity="0.6" />
      <circle cx="64" cy="26" r="2" fill="white" opacity="0.5" />
      <circle cx="78" cy="28" r="2.5" fill="white" opacity="0.6" />
      <circle cx="88" cy="32" r="3" fill="white" opacity="0.8" />
    </svg>
  );
}
