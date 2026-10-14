import { useState } from "react";
import type { GalleryMedia } from "@/types/database";

export function GalleryLightbox({ items }: { items: GalleryMedia[] }) {
  const [active, setActive] = useState<GalleryMedia | null>(null);
  if (!items.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="overflow-hidden rounded-[16px]"
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
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setActive(null)}
          aria-label="Close gallery"
        >
          {active.media_type === "video" ? (
            <video src={active.media_url} className="max-h-full max-w-full rounded-[12px]" controls autoPlay />
          ) : (
            <img src={active.media_url} alt="" className="max-h-full max-w-full rounded-[12px]" />
          )}
        </button>
      ) : null}
    </>
  );
}
