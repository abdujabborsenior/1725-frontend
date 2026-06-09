'use client';

import { useMemo } from 'react';

export interface Series {
  label: string;
  color: string;
  points: { date: string; count: string | number }[];
}

const W = 720;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

function lastNDates(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function GrowthChart({ series, days = 30 }: { series: Series[]; days?: number }) {
  const dates = useMemo(() => lastNDates(days), [days]);

  const seriesData = useMemo(() => {
    return series.map((s) => {
      const map = new Map<string, number>();
      for (const p of s.points) {
        map.set(String(p.date).slice(0, 10), Number(p.count));
      }
      return { ...s, values: dates.map((d) => map.get(d) ?? 0) };
    });
  }, [series, dates]);

  const max = useMemo(() => {
    const m = Math.max(1, ...seriesData.flatMap((s) => s.values));
    return m;
  }, [seriesData]);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (dates.length <= 1 ? 0 : (i / (dates.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  function linePath(values: number[]) {
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  }
  function areaPath(values: number[]) {
    const top = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    return `${top} L ${x(values.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const labelIdx = [0, Math.floor(dates.length / 2), dates.length - 1];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          {seriesData.map((s, i) => (
            <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* grid */}
        {gridLines.map((g, i) => {
          const gy = PAD.top + innerH - g * innerH;
          return (
            <g key={i}>
              <line x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
              <text x={PAD.left - 6} y={gy + 3} textAnchor="end" className="fill-slate-400" fontSize="9">
                {Math.round(g * max)}
              </text>
            </g>
          );
        })}

        {/* x labels */}
        {labelIdx.map((idx) => (
          <text key={idx} x={x(idx)} y={H - 8} textAnchor="middle" className="fill-slate-400" fontSize="9">
            {dates[idx]?.slice(5)}
          </text>
        ))}

        {/* series */}
        {seriesData.map((s, i) => (
          <g key={i}>
            <path d={areaPath(s.values)} fill={`url(#grad-${i})`} />
            <path d={linePath(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 justify-center">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
