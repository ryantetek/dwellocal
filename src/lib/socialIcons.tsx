import type { ReactElement, SVGProps } from "react";
import { getIcon } from "@/lib/icons";

type SvgProps = SVGProps<SVGSVGElement>;

function FacebookIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function InstagramIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.2 3c.4 2.6 1.8 4.4 4.3 4.7v3.1c-1.5 0-2.9-.5-4.1-1.3v6.7c0 3.4-2.7 6.1-6.2 6.1S2 19.6 2 16.2 4.7 10.1 8.2 10.1c.4 0 .8 0 1.1.1v3.2c-.3-.1-.7-.2-1.1-.2-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V3h2.9Z" />
    </svg>
  );
}

const SOCIAL_BRAND: Record<string, (props: SvgProps) => ReactElement> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  tik_tok: TikTokIcon,
};

export function getSocialIcon(platform?: string | null, icon?: string | null) {
  const key = (icon || platform || "").toLowerCase().replace(/\s+/g, "");
  if (key in SOCIAL_BRAND) return SOCIAL_BRAND[key];
  return getIcon(icon || "sparkles");
}
