import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { AdminMessage } from "@/types/database";

export function SupportChat({
  messages,
  resolved,
  staffOnRight,
  hostLabel,
  staffLabel,
  emptyLabel = "No messages yet.",
  className,
}: {
  messages: AdminMessage[];
  resolved?: boolean;
  staffOnRight: boolean;
  hostLabel: string;
  staffLabel: string;
  emptyLabel?: string;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length]);

  return (
    <div
      ref={scroller}
      className={cn(
        "min-h-[16rem] flex-1 space-y-3 overflow-y-auto px-5 py-4",
        resolved ? "bg-emerald-50/80" : "bg-slate-50",
        className,
      )}
    >
      {messages.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : null}
      {messages.map((msg) => {
        const fromStaff = msg.from_super_admin;
        const mineOnRight = fromStaff === staffOnRight;
        return (
          <div key={msg.id} className={cn("flex", mineOnRight ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-[16px] px-4 py-3",
                fromStaff
                  ? cn("rounded-tr-md text-white", resolved ? "bg-emerald-800" : "bg-slate-800")
                  : "rounded-tl-md bg-white text-slate-800 shadow-sm",
              )}
            >
              <p className={cn("text-xs font-medium", fromStaff ? "text-white/70" : "text-slate-500")}>
                {fromStaff ? staffLabel : hostLabel}
                {msg.subject ? ` · ${msg.subject}` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{msg.body}</p>
              <p className={cn("mt-1 text-[11px]", fromStaff ? "text-white/50" : "text-slate-400")}>
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ResolvedBadge({ resolved }: { resolved: boolean }) {
  if (!resolved) return null;
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      Resolved
    </span>
  );
}
