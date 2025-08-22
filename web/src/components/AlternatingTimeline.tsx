// /opt/webapps/cv-blog/web/src/components/AlternatingTimeline.tsx
import { useMemo } from 'react';
import type { TimelineItem } from '../types';

export default function AlternatingTimeline({
  items,
  newestFirst = true,
  overlapRem = 0.75, // e.g. 0.5=8px, 1=16px
}: {
  items: TimelineItem[];
  newestFirst?: boolean;
  overlapRem?: number;
}) {
  const ordered = useMemo(() => {
    const a = Array.isArray(items) ? [...items] : [];
    a.sort((x, y) => (newestFirst ? y.date.localeCompare(x.date) : x.date.localeCompare(y.date)));
    return a;
  }, [items, newestFirst]);

  // split into two desktop columns
  const leftCol  = ordered.filter((_, i) => i % 2 === 0);
  const rightCol = ordered.filter((_, i) => i % 2 === 1);
  const rows = Math.max(leftCol.length, rightCol.length);

  // margins (affect layout → visible overlap)
  const leftStyle  = { marginTop: `-${overlapRem}rem` } as React.CSSProperties;
  const rightStyle = { marginTop: `${overlapRem}rem` } as React.CSSProperties;

  return (
    <div className="relative">
      {/* desktop spine */}
      <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-0.5 bg-gray-200 h-full" />

      {/* DESKTOP: paired rows keep dot cadence even */}
      <ul className="hidden md:block space-y-4">
        {Array.from({ length: rows }).map((_, r) => {
          const L = leftCol[r];
          const R = rightCol[r];
          return (
            <li key={r} className="grid md:grid-cols-[1fr,24px,1fr] md:gap-6 items-start">
              {/* left cell (nudged up) */}
              <div>{L && <Card item={L} align="right" style={leftStyle} />}</div>

              {/* dot (fixed per row) */}
              <div className="flex items-start justify-center relative">
                <span className="mt-5 block w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
              </div>

              {/* right cell (nudged down) */}
              <div>{R && <Card item={R} align="left" style={rightStyle} />}</div>
            </li>
          );
        })}
      </ul>

      {/* MOBILE: single column (no overlap) */}
      <ul className="md:hidden space-y-4">
        {ordered.map((t, i) => (
          <li key={t.id ?? `${t.date}-${i}`}><Card item={t} align="full" /></li>
        ))}
      </ul>
    </div>
  );
}

function Card({
  item,
  align,
  style,
}: {
  item: TimelineItem;
  align: 'left' | 'right' | 'full';
  style?: React.CSSProperties;
}) {
  const notch =
    align === 'left'
      ? 'md:block absolute top-6 -left-1 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45'
      : align === 'right'
      ? 'md:block absolute top-6 -right-1 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45'
      : '';

  return (
    <article className="relative border rounded-2xl p-4 bg-white shadow-sm" style={style}>
      {align !== 'full' && <span className={`hidden ${notch}`} />}
      <div className="text-xs text-gray-500">{item.date}</div>
      <h3 className="font-medium mt-1">{item.label}</h3>
      {item.description && <p className="text-sm mt-1">{item.description}</p>}
    </article>
  );
}

