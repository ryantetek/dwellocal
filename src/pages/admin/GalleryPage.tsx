import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoBundle } from "@/data/demo";
import { compressImageToWebp } from "@/lib/compress";
import { MAX_VIDEO_BYTES } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import type { GalleryMedia } from "@/types/database";

export function GalleryPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const { plan } = useAuth();
  const [items, setItems] = useState<GalleryMedia[]>([]);

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setItems(demoBundle.gallery);
      return;
    }
    if (!supabase) return;
    void supabase
      .from("gallery_media")
      .select("*")
      .eq("property_id", current.id)
      .order("sort_order")
      .then(({ data }) => setItems((data as GalleryMedia[]) ?? []));
  }, [current, isDemo]);

  async function onFile(file: File) {
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !current) return;
    if (items.length >= plan.galleryLimit) {
      toast.error(`Free/current plan allows ${plan.galleryLimit} media items. Upgrade for more.`);
      return;
    }
    const isVideo = file.type.startsWith("video/");
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      toast.error("Videos must be 20MB or smaller.");
      return;
    }
    const blob = isVideo ? file : await compressImageToWebp(file);
    const ext = isVideo ? file.name.split(".").pop() : "webp";
    const path = `${current.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, blob, {
      contentType: isVideo ? file.type : "image/webp",
    });
    if (uploadError) {
      toast.error(uploadError.message);
      return;
    }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { data, error } = await supabase
      .from("gallery_media")
      .insert({
        property_id: current.id,
        media_url: pub.publicUrl,
        media_type: isVideo ? "video" : "image",
        sort_order: items.length,
      })
      .select()
      .single();
    if (error) toast.error(error.message);
    else setItems((list) => [...list, data as GalleryMedia]);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Gallery</h1>
      <p className="mt-1 text-sm text-slate-500">
        {items.length} / {plan.galleryLimit} items · images compress to WebP in the browser · videos max 20MB
      </p>
      <label className="mt-4 inline-flex cursor-pointer rounded-[12px] border border-dashed border-slate-300 bg-white px-4 py-8 text-sm text-slate-600">
        Upload media
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
      </label>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-[12px] bg-white">
            {item.media_type === "video" ? (
              <video src={item.media_url} className="h-32 w-full object-cover" />
            ) : (
              <img src={item.media_url} alt="" className="h-32 w-full object-cover" />
            )}
          </div>
        ))}
      </div>
      {!isDemo && plan.plan === "free" ? (
        <Button asChild variant="slate" className="mt-6">
          <Link to="/admin/upgrade">Upgrade for 20 uploads</Link>
        </Button>
      ) : null}
    </div>
  );
}
