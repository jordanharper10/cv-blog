import SocialIcon from './SocialIcon';
import { Profile } from '../types';

type SocialItem = { key: string; url: string; icon?: string };

function normalizeSocials(input: any): SocialItem[] {
  // New format: array of {key,url,icon}
  if (Array.isArray(input)) return input.filter(s => s?.url);
  // Old format: object { key: url }
  if (input && typeof input === 'object') {
    return Object.entries(input).map(([key, url]) => ({ key, url: String(url), icon: key }));
  }
  return [];
}

export default function HeroCard({ profile }: { profile: Profile }) {
  const socials = normalizeSocials(profile.socials);

  return (
    <section className="grid md:grid-cols-[auto,1fr] gap-6 items-center">
      <img src={profile.photo_url || '/avatar.png'} alt="Profile" className="w-28 h-28 rounded-2xl object-cover" />
      <div>
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <p className="text-gray-600">{profile.title} · {profile.location}</p>

        {!!socials.length && (
          <div className="flex gap-3 mt-3">
            {socials.map(s => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border hover:bg-gray-50"
                aria-label={s.key}
                title={s.key}
              >
                <SocialIcon name={s.icon || s.key} className="w-5 h-5" />
              </a>
            ))}
          </div>
        )}

        {!!(profile.certs?.length) && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {profile.certs!.map((c,i) => (<img key={i} src={c} alt="cert" className="h-8" />))}
          </div>
        )}
      </div>
    </section>
  );
}

