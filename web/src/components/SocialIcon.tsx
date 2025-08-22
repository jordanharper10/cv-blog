// /opt/webapps/cv-blog/web/src/components/SocialIcon.tsx
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Instagram,
  Youtube,
  Link as LinkIcon,
  Facebook,
  Gitlab,
  Twitch,
  MessageCircle, // used as a Discord stand‑in
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  gitlab: Gitlab,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,           // treat “x” as Twitter
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  twitch: Twitch,
  discord: MessageCircle, // fallback (Lucide has no brand Discord icon)
  mail: Mail,
  link: LinkIcon,
  globe: Globe,
};

export default function SocialIcon({ name, className }: { name?: string; className?: string }) {
  const key = (name || '').toLowerCase();
  const Cmp = ICONS[key] || ICONS.globe;
  return <Cmp className={className || 'w-5 h-5'} />;
}

