import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-[12px] border border-dwell-sand bg-white px-3 py-2 text-sm text-dwell-charcoal placeholder:text-dwell-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dwell-green/50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
