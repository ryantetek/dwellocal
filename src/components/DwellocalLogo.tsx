import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  inverted?: boolean;
};

export function DwellocalLogo({
  className,
  markClassName,
  showWordmark = true,
  showTagline = false,
  inverted = false,
}: Props) {
  const ink = inverted ? "#F5F1E8" : "#171A19";
  const deep = inverted ? "#D9E4D8" : "#30483B";
  const fill = inverted ? "#6F8F78" : "#6F8F78";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        className={cn("h-9 w-9 shrink-0", markClassName)}
        aria-hidden="true"
      >
        <path
          d="M10 40 L32 16 L54 40"
          stroke={deep}
          strokeWidth="4.2"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="20" y="38" width="24" height="16" rx="3" fill={fill} />
        <rect x="28" y="44" width="8" height="10" rx="1.6" fill={inverted ? "#171A19" : "#F5F1E8"} />
      </svg>
      {showWordmark ? (
        <div className="leading-tight">
          <div className="font-heading text-[1.15rem] font-bold tracking-tight" style={{ color: ink }}>
            Dwellocal
          </div>
          {showTagline ? (
            <div className="text-[11px] tracking-[0.14em] uppercase" style={{ color: inverted ? "#d9e4d8" : "#5c645f" }}>
              Manage. Showcase. Grow.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
