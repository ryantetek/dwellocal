import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { EnquiryForm } from "@/components/property/EnquiryForm";

export function InquiryWidget({
  propertyId,
  readOnly,
}: {
  propertyId: string;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="mb-3 w-[min(100vw-2.5rem,22rem)] rounded-[16px] border border-dwell-sand bg-white p-4 shadow-lg">
          <p className="font-heading font-semibold">Enquire</p>
          <EnquiryForm propertyId={propertyId} readOnly={readOnly} idPrefix="popup-enq" className="mt-3" />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-dwell-deep text-white shadow-lg"
        aria-label="Open enquiry"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
