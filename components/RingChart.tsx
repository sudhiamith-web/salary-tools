export default function RingChart({
  percent,
  color,
  trackColor = "#E2E8F0",
  label,
  sublabel,
  size = 110,
}: {
  percent: number; // 0-100, the filled portion
  color: string;
  trackColor?: string;
  label: string;
  sublabel: string;
  size?: number;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, percent)) / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl text-ink leading-none">{label}</span>
        <span className="text-[10px] text-charcoal/50 mt-1">{sublabel}</span>
      </div>
    </div>
  );
}
