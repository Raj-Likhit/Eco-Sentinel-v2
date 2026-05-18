'use client';

interface SparklineProps {
  color: string;
  data: number[];
}

export default function Sparkline({ color, data }: SparklineProps) {
  const w = 80,
    h = 24;
  const min = Math.min(...data),
    max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min + 0.01)) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}
