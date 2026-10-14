import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function EnquiryForm({
  propertyId,
  readOnly,
  idPrefix,
  className,
  wide = false,
}: {
  propertyId: string;
  readOnly?: boolean;
  idPrefix?: string;
  className?: string;
  wide?: boolean;
}) {
  const uid = useId();
  const prefix = idPrefix ?? uid;
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) {
      setStatus("Demo only — this form is disabled and messages are not sent.");
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
    <form onSubmit={submit} className={cn("space-y-3", className)}>
      {readOnly ? (
        <p className="rounded-[12px] bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Demo only — enquiry is shown as a preview and cannot be sent.
        </p>
      ) : null}
      <div className={wide ? "grid gap-3 sm:grid-cols-2" : "contents"}>
        <div>
          <Label htmlFor={`${prefix}-name`}>Name</Label>
          <Input
            id={`${prefix}-name`}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-email`}>Email</Label>
          <Input
            id={`${prefix}-email`}
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            disabled={readOnly}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${prefix}-msg`}>Message</Label>
        <Textarea
          id={`${prefix}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={readOnly}
        />
      </div>
      {status ? <p className="text-xs text-dwell-muted">{status}</p> : null}
      <Button type="submit" className="w-full" disabled={readOnly}>
        Send enquiry
      </Button>
    </form>
  );
}
