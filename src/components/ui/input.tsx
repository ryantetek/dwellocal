import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-[12px] border border-dwell-sand bg-white px-3 text-sm text-dwell-charcoal placeholder:text-dwell-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dwell-green/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
