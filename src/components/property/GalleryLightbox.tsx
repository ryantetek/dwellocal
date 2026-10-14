import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryMedia } from "@/types/database";

export function GalleryLightbox({ items }: { items: GalleryMedia[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const active = index === null ? null : items[index];

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % items.length));
      if (event.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length]);

  if (!items.length) return null;

  function step(delta: number) {
    setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            className="overflow-hidden rounded-[16px]"
            aria-label={`Open gallery slideshow, item ${i + 1}`}
          >
            {item.media_type === "video" ? (
              <video src={item.media_url} className="h-40 w-full object-cover md:h-52" muted />
            ) : (
              <img src={item.media_url} alt="" className="h-40 w-full object-cover md:h-52" />
            )}
          </button>
        ))}
      </div>
      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-10"
          onClick={() => setIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery slideshow"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white"
            onClick={() => setIndex(null)}
            aria-label="Close slideshow"
          >
            <X className="h-5 w-5" />
          </button>
          {items.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-3 rounded-full bg-white/15 p-2 text-white md:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-3 rounded-full bg-white/15 p-2 text-white md:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {active.media_type === "video" ? (
              <video src={active.media_url} className="max-h-[80vh] w-full rounded-[12px]" controls autoPlay />
            ) : (
              <img src={active.media_url} alt="" className="max-h-[80vh] w-full rounded-[12px] object-contain" />
            )}
            <p className="mt-3 text-center text-sm text-white/80">
              {(index ?? 0) + 1} / {items.length}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
