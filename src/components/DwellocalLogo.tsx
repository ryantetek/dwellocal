import { cn } from "@/lib/utils";

export type LogoVariant = "gable" | "letter" | "window" | "local";

type Props = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  inverted?: boolean;
  variant?: LogoVariant;
  size?: "md" | "lg";
};

function Mark({
  variant,
  inverted,
  className,
}: {
  variant: LogoVariant;
  inverted: boolean;
  className?: string;
}) {
  const ink = inverted ? "#F5F1E8" : "#171A19";
  const deep = inverted ? "#D9E4D8" : "#30483B";
  const fill = "#6F8F78";
  const door = inverted ? "#171A19" : "#F5F1E8";

  if (variant === "letter") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M15 9h19c13.2 0 22.5 8.6 22.5 23S47.2 55 34 55H15V9Z" fill={deep} />
        <path
          d="M27 19.5c0-3.2 2.8-5.6 6.2-5.6s6.2 2.4 6.2 5.6V46H27V19.5Z"
          fill={door}
        />
        <circle cx="36.6" cy="34" r="2.9" fill={deep} />
      </svg>
    );
  }

  if (variant === "window") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect x="10" y="10" width="44" height="44" rx="12" fill={deep} />
        <rect x="16" y="16" width="14" height="14" rx="3" fill={fill} />
        <rect x="34" y="16" width="14" height="14" rx="3" fill={door} />
        <rect x="16" y="34" width="14" height="14" rx="3" fill={door} />
        <rect x="34" y="34" width="14" height="14" rx="3" fill={fill} />
      </svg>
    );
  }

  if (variant === "local") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M32 8c11 0 20 9 20 20 0 14-20 28-20 28S12 42 12 28C12 17 21 8 32 8Z" fill={deep} />
        <path d="M22 30 L32 18 L42 30 V40 H22 Z" fill={fill} />
        <rect x="29" y="32" width="6" height="8" rx="1" fill={door} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="14" fill={inverted ? "#171A19" : "transparent"} />
      <path d="M12 38 L32 16 L52 38" stroke={deep} strokeWidth="4.2" strokeLinejoin="round" fill="none" />
      <rect x="20" y="36" width="24" height="16" rx="3" fill={fill} />
      <rect x="28" y="42" width="8" height="10" rx="1.6" fill={door} />
      <circle cx="32" cy="16" r="0" fill={ink} />
    </svg>
  );
}

export function DwellocalLogo({
  className,
  markClassName,
  showWordmark = true,
  showTagline = false,
  inverted = false,
  variant = "letter",
  size = "md",
}: Props) {
  const ink = inverted ? "#F5F1E8" : "#171A19";
  const large = size === "lg";

  return (
    <div className={cn("flex items-center", large ? "gap-4" : "gap-3", className)}>
      <Mark
        variant={variant}
        inverted={inverted}
        className={cn(large ? "h-12 w-12" : "h-9 w-9", "shrink-0", markClassName)}
      />
      {showWordmark ? (
        <div className="leading-tight">
          <div
            className={cn("font-heading font-bold tracking-tight", large ? "text-2xl" : "text-[1.15rem]")}
            style={{ color: ink }}
          >
            Dwellocal
          </div>
          {showTagline ? (
            <div
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ color: inverted ? "#d9e4d8" : "#5c645f" }}
            >
              Manage. Showcase. Grow.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
