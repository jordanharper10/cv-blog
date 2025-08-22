import { useEffect, useState } from 'react';
import { getCV } from '../api';

export default function CV() {
  const [cv, setCv] = useState<any>(null);
  useEffect(() => { getCV().then(setCv); }, []);
  if (!cv) return null;

  // Fallbacks from profile if meta is empty
  const name = cv.meta?.name || cv.profile?.name || cv.meta?.headline || 'Your Name';
  const tagline = cv.meta?.tagline || cv.profile?.title || '';
  const location = cv.meta?.location || cv.profile?.location || '';

  return (
    <div className="cv-sheet mx-auto my-8 print:my-0 bg-white shadow-sm rounded-2xl p-8">
      {/* HEADER — always visible and prints */}
      <header className="mb-5 border-b pb-4">
        <h1 className="text-4xl font-semibold tracking-tight">{name}</h1>
        <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
          {tagline && <span>{tagline}</span>}
          {location && <span>· {location}</span>}
        </div>

        {/* Inline contact row shows actual details
        {cv.links?.length > 0 && (
          <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
            {cv.links.slice(0, 4).map((l: any) => (
              <a
                key={l.id}
                className="underline underline-offset-4"
                href={l.url}
                target="_blank"
                rel="noreferrer"
              >
                {l.display}
              </a>
            ))}
          </div>
        )} */}
      </header>

      {/* BODY: two columns */}
      <div className="grid gap-8 md:grid-cols-[280px,1fr]">
        {/* LEFT */}
        <aside className="space-y-7">
          {/* CONTACT (full list) */}
          {cv.links?.length > 0 && (
            <Section title="CONTACT">
              <ul className="text-sm space-y-1 leading-6">
                {cv.links.map((l: any) => (
                  <li key={l.id}>
                    <a
                      className="underline underline-offset-4 hover:no-underline"
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.display}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* SKILLS */}
          {cv.skills?.length > 0 && (
            <Section title="SKILLS">
              <ul className="space-y-3">
                {cv.skills.map((g: any) => (
                  <li key={g.id}>
                    <div className="text-[0.8rem] font-semibold tracking-wide text-gray-800">
                      {g.category}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(g.items || []).map((s: string, i: number) => (
                        <span key={i} className="cv-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* CERTIFICATIONS */}
          {cv.certs?.length > 0 && (
            <Section title="CERTIFICATIONS">
              <ul className="space-y-2">
                {cv.certs.map((c: any) => (
                  <li key={c.id} className="text-sm">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-600">
                      {c.issuer}
                      {c.issued ? ` · ${fmtYM(c.issued)}` : ''}
                    </div>
                    {c.url && (
                      <div className="text-xs">
                        <a
                          className="underline underline-offset-4"
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {shortenUrl(c.url)}
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </aside>

        {/* RIGHT */}
        <main className="space-y-10">
          {/* EXPERIENCE */}
          {cv.exp?.length > 0 && (
            <Section title="EXPERIENCE">
              <ul className="space-y-6">
                {cv.exp.map((e: any) => (
                  <li key={e.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[1.05rem] font-semibold">
                        {e.role}{' '}
                        <span className="font-normal text-gray-700">· {e.company}</span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {fmtRange(e.start_date, e.end_date)}
                      </div>
                    </div>
                    {e.location && (
                      <div className="text-xs text-gray-500 mt-0.5">{e.location}</div>
                    )}
                    {(e.bullets || []).length > 0 && (
                      <ul className="cv-bullets mt-2">
                        {e.bullets.map((b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {(e.tech || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {e.tech.map((t: string, i: number) => (
                          <span key={i} className="cv-chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* EDUCATION */}
          {cv.edu?.length > 0 && (
            <Section title="EDUCATION">
              <ul className="space-y-6">
                {cv.edu.map((d: any) => (
                  <li key={d.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[1.05rem] font-semibold">
                        {d.degree}{' '}
                        <span className="font-normal text-gray-700">· {d.school}</span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {fmtRange(d.start_date, d.end_date)}
                      </div>
                    </div>
                    {d.location && (
                      <div className="text-xs text-gray-500 mt-0.5">{d.location}</div>
                    )}
                    {(d.notes || []).length > 0 && (
                      <ul className="cv-bullets mt-2">
                        {d.notes.map((n: string, i: number) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <section>
      <h2 className="text-[0.7rem] tracking-[0.18em] font-semibold text-gray-500 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function fmtRange(a?: string, b?: string) {
  const A = (a || '').slice(0, 7);
  const B = (b || '').slice(0, 7);
  return B ? `${A} — ${B}` : `${A} — Present`;
}
function fmtYM(s: string) { return s.slice(0, 7); }
function shortenUrl(u: string) {
  try { const x = new URL(u); return x.host + x.pathname.replace(/\/$/, ''); }
  catch { return u; }
}

