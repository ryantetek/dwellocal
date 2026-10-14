import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoExpenses, demoIncome } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseEntry, IncomeEntry } from "@/types/database";

export function IncomePage() {
  return (
    <Ledger
      title="Income ledger"
      hint="Manual income only — Dwellocal does not process payments."
      demoRows={demoIncome}
      table="income_entries"
      fields={[
        ["guest_name", "Guest"],
        ["amount", "Amount"],
        ["currency", "Currency"],
        ["entry_date", "Date"],
        ["description", "Description"],
        ["payment_method", "Method"],
      ]}
    />
  );
}

export function ExpensesPage() {
  return (
    <Ledger
      title="Expense ledger"
      hint="Track payees and categories by hand."
      demoRows={demoExpenses}
      table="expense_entries"
      fields={[
        ["payee_name", "Payee"],
        ["category", "Category"],
        ["amount", "Amount"],
        ["currency", "Currency"],
        ["entry_date", "Date"],
        ["description", "Description"],
        ["payment_method", "Method"],
      ]}
    />
  );
}

function Ledger({
  title,
  hint,
  demoRows,
  table,
  fields,
}: {
  title: string;
  hint: string;
  demoRows: Array<IncomeEntry | ExpenseEntry>;
  table: string;
  fields: Array<[string, string]>;
}) {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({ currency: "USD" });

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setRows(demoRows as unknown as Record<string, unknown>[]);
      return;
    }
    if (!supabase) return;
    void supabase
      .from(table)
      .select("*")
      .eq("property_id", current.id)
      .order("entry_date", { ascending: false })
      .then(({ data }) => setRows((data as Record<string, unknown>[]) ?? []));
  }, [current, demoRows, isDemo, table]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) return toast.message("Demo is read-only.");
    if (!supabase || !current) return;
    const payload = {
      ...form,
      amount: Number(form.amount),
      property_id: current.id,
    };
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) toast.error(error.message);
    else setRows((list) => [data as Record<string, unknown>, ...list]);
  }

  const total = rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p className="text-sm text-slate-500">{hint}</p>
      <p className="mt-2 text-lg font-semibold">{formatCurrency(total)}</p>
      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-[16px] border border-slate-200 bg-white p-5 md:grid-cols-3">
        {fields.map(([key, label]) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input
              className="border-slate-200"
              type={key === "amount" ? "number" : key.includes("date") ? "date" : "text"}
              value={form[key] ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required={key !== "description"}
            />
          </div>
        ))}
        <Button variant="slate" className="md:col-span-3">
          Add entry
        </Button>
      </form>
      <ul className="mt-6 divide-y divide-slate-100 rounded-[16px] border border-slate-200 bg-white">
        {rows.map((row) => (
          <li key={String(row.id)} className="flex justify-between px-5 py-3 text-sm">
            <span>{String(row.guest_name ?? row.payee_name)}</span>
            <span>
              {formatCurrency(Number(row.amount), String(row.currency ?? "USD"))} · {String(row.entry_date)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
