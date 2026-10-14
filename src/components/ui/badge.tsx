import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-dwell-sage px-3 py-1 text-xs font-medium text-dwell-deep",
        className,
      )}
      {...props}
    />
  );
}
