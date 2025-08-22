import { useEffect, useState } from 'react';
import { getTimeline } from '../api';
import type { TimelineItem } from '../types';

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  useEffect(() => { getTimeline().then(setItems); }, []);

  // optional: newest first; change to .sort((a,b)=>a.date.localeCompare(b.date)) for oldest->newest
  const data = items.slice().sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Timeline</h1>

      <div className="relative">
        {/* vertical line */}
        <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-0.5 bg-gray-200 h-full" />

        <ul className="space-y-8">
          {data.map((t, i) => {
            const left = i % 2 === 0; // alternate sides
            return (
              <li key={t.id} className="md:grid md:grid-cols-2 md:gap-10 items-start">
                {/* left column */}
                <div className={`md:pr-10 ${left ? 'md:order-1' : 'md:order-2'}`}>
                  {left && (
                    <TimelineCard item={t} align="right" />
                  )}
                </div>

                {/* center dot (absolute for md+) */}
                <div className="hidden md:block relative md:order-2">
                  <span className="absolute left-1/2 -translate-x-1/2 -mt-1 block w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                </div>

                {/* right column */}
                <div className={`md:pl-10 ${left ? 'md:order-3' : 'md:order-1'}`}>
                  {!left && (
                    <TimelineCard item={t} align="left" />
                  )}
                </div>

                {/* mobile single-column card */}
                <div className="md:hidden">
                  <TimelineCard item={t} align="full" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function TimelineCard({ item, align }: { item: any; align: 'left'|'right'|'full' }) {
  const alignCls =
    align === 'left' ? 'md:ml-0 md:mr-auto'
  : align === 'right' ? 'md:mr-0 md:ml-auto'
  : '';

  return (
    <article className={`relative border rounded-2xl p-4 bg-white shadow-sm ${alignCls}`}>
      {/* bubble pointer for md+ */}
      {align !== 'full' && (
        <span
          className={`hidden md:block absolute top-6 w-3 h-3 bg-white border-l border-t border-gray-200
            ${align === 'left'
              ? '-left-1 rotate-45'
              : '-right-1 rotate-45'
            }`}
        />
      )}
      <div className="text-xs text-gray-500">{item.date}</div>
      <h3 className="font-medium mt-1">{item.label}</h3>
      {item.description && <p className="text-sm mt-1">{item.description}</p>}
    </article>
  );
}


