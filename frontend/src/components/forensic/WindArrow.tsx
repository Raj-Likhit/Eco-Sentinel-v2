'use client';

interface WindArrowProps {
  x: number;
  y: number;
  direction: number;
  speed: number;
}

function WindArrow({ x, y, direction, speed }: WindArrowProps) {
  const len = 18 + speed * 2;
  const rad = (direction * Math.PI) / 180;
  const dx = Math.sin(rad) * len;
  const dy = -Math.cos(rad) * len;

  return (
    <g transform={`translate(${x},${y})`} opacity="0.5">
      <line x1={0} y1={0} x2={dx} y2={dy} stroke="#10b981" strokeWidth="1" />
      <circle cx={0} cy={0} r={2} fill="#10b981" />
      <polygon
        points={`${dx},${dy} ${dx - Math.cos(rad) * 5 - Math.sin(rad) * 3},${dy + Math.sin(rad) * 5 - Math.cos(rad) * 3} ${dx - Math.cos(rad) * 5 + Math.sin(rad) * 3},${dy + Math.sin(rad) * 5 + Math.cos(rad) * 3}`}
        fill="#10b981"
      />
    </g>
  );
}

export default WindArrow;
