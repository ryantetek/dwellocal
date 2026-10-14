import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export function InquiryWidget({
  propertyId,
  readOnly,
}: {
  propertyId: string;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) {
      setStatus("Demo mode — messages are not sent.");
      return;
    }
    if (!supabase) {
      setStatus("Messaging is unavailable until the host connects the platform.");
      return;
    }
    const { error } = await supabase.from("chat_messages").insert({
      property_id: propertyId,
      guest_name: guestName,
      guest_email: guestEmail,
      message,
    });
    if (error) setStatus(error.message);
    else {
      setStatus("Sent. The host will reply by email.");
      setMessage("");
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <form
          onSubmit={submit}
          className="mb-3 w-[min(100vw-2.5rem,22rem)] rounded-[16px] border border-dwell-sand bg-white p-4 shadow-lg"
        >
          <p className="font-heading font-semibold">Enquire</p>
          <div className="mt-3 space-y-2">
            <div>
              <Label htmlFor="inq-name">Name</Label>
              <Input id="inq-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="inq-email">Email</Label>
              <Input
                id="inq-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="inq-msg">Message</Label>
              <Textarea id="inq-msg" value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            {status ? <p className="text-xs text-dwell-muted">{status}</p> : null}
            <Button type="submit" className="w-full">
              Send
            </Button>
          </div>
        </form>
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
