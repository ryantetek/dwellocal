import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoReservations } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { randomToken } from "@/lib/utils";
import type { Reservation } from "@/types/database";

const emptyForm = {
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  party_size: 2,
  start_date: "",
  end_date: "",
  details: "",
  notes: "",
};

export function CalendarPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const [cursor, setCursor] = useState(new Date());
  const [rows, setRows] = useState<Reservation[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setRows(demoReservations);
      return;
    }
    if (!supabase) return;
    void supabase
      .from("reservations")
      .select("*")
      .eq("property_id", current.id)
      .then(({ data }) => setRows((data as Reservation[]) ?? []));
  }, [current, isDemo]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  function reservationOn(day: Date) {
    return rows.find((r) => {
      const interval = { start: parseISO(r.start_date), end: parseISO(r.end_date) };
      if (interval.end < interval.start) return false;
      return isWithinInterval(day, interval) && r.status === "reserved";
    });
  }

  async function createReservation(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !current) return;
    const guide_token = randomToken();
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        ...form,
        party_size: Number(form.party_size),
        property_id: current.id,
        status: "reserved",
        guide_token,
        guide_expires_at: form.end_date,
      })
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      setRows((list) => [...list, data as Reservation]);
      setForm(emptyForm);
      toast.success("Reservation saved");
    }
  }

  const guideUrl =
    selected?.guide_token && typeof window !== "undefined"
      ? `${window.location.origin}/guide/${selected.guide_token}`
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">{format(cursor, "MMMM yyyy")}</h1>
          <div className="flex gap-2">
            <Button variant="slate-outline" size="sm" onClick={() => setCursor(addMonths(cursor, -1))}>
              Prev
            </Button>
            <Button variant="slate-outline" size="sm" onClick={() => setCursor(addMonths(cursor, 1))}>
              Next
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const res = reservationOn(day);
            return (
              <button
                type="button"
                key={day.toISOString()}
                onClick={() => res && setSelected(res)}
                className={`min-h-16 rounded-[12px] border p-1 text-left text-xs ${
                  res ? "border-slate-300 bg-slate-800 text-white" : "border-slate-100 bg-white"
                }`}
              >
                <div>{format(day, "d")}</div>
                {res ? <div className="mt-1 truncate">{res.guest_name}</div> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        <form onSubmit={createReservation} className="rounded-[16px] border border-slate-200 bg-white p-5">
          <h2 className="font-heading font-semibold">New reservation</h2>
          <div className="mt-3 space-y-3">
            <div>
              <Label>Guest name</Label>
              <Input className="border-slate-200" value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="border-slate-200" type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="border-slate-200" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start</Label>
                <Input className="border-slate-200" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div>
                <Label>End</Label>
                <Input className="border-slate-200" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Party size</Label>
              <Input className="border-slate-200" type="number" min={1} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea className="border-slate-200" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea className="border-slate-200" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button variant="slate" type="submit" className="w-full">
              Save stay
            </Button>
          </div>
        </form>
        {selected && guideUrl ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-5">
            <h2 className="font-heading font-semibold">Guest guide QR</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.guest_name}</p>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG value={guideUrl} size={160} />
            </div>
            <p className="mt-3 break-all text-xs text-slate-500">{guideUrl}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
