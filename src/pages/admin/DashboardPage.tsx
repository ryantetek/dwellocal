import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { demoExpenses, demoIncome, demoReservations } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseEntry, IncomeEntry, Reservation } from "@/types/database";

export function DashboardPage() {
  const { current } = useProperties();
  const { isDemo } = useDemo();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);

  useEffect(() => {
    if (!current) return;
    if (isDemo) {
      setReservations(demoReservations);
      setIncome(demoIncome);
      setExpenses(demoExpenses);
      return;
    }
    if (!supabase) return;
    void Promise.all([
      supabase.from("reservations").select("*").eq("property_id", current.id),
      supabase.from("income_entries").select("*").eq("property_id", current.id),
      supabase.from("expense_entries").select("*").eq("property_id", current.id),
    ]).then(([r, i, e]) => {
      setReservations((r.data as Reservation[]) ?? []);
      setIncome((i.data as IncomeEntry[]) ?? []);
      setExpenses((e.data as ExpenseEntry[]) ?? []);
    });
  }, [current, isDemo]);

  const occupiedNights = reservations
    .filter((r) => r.status === "reserved")
    .reduce((sum, r) => {
      const start = parseISO(r.start_date);
      const end = parseISO(r.end_date);
      return sum + Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    }, 0);

  const chart = useMemo(() => {
    const buckets = new Map<string, { week: string; income: number; expenses: number }>();
    const add = (date: string, field: "income" | "expenses", amount: number) => {
      const d = parseISO(date);
      const key = format(d, "yyyy-'W'II");
      const currentBucket = buckets.get(key) ?? { week: format(d, "MMM d"), income: 0, expenses: 0 };
      currentBucket[field] += amount;
      buckets.set(key, currentBucket);
    };
    income.forEach((row) => add(row.entry_date, "income", Number(row.amount)));
    expenses.forEach((row) => add(row.entry_date, "expenses", Number(row.amount)));
    return Array.from(buckets.values());
  }, [expenses, income]);

  const upcoming = reservations
    .filter((r) => r.status === "reserved" && parseISO(r.start_date).getTime() >= Date.now() - 86400000)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500">{current?.name}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Reserved nights", String(occupiedNights)],
          ["Income entries", formatCurrency(income.reduce((s, r) => s + Number(r.amount), 0))],
          ["Expense entries", formatCurrency(expenses.reduce((s, r) => s + Number(r.amount), 0))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[16px] border border-slate-200 bg-white p-5">
        <h2 className="font-heading font-semibold">Income vs expenses</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#334155" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[16px] border border-slate-200 bg-white p-5">
        <h2 className="font-heading font-semibold">Upcoming reservations</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {upcoming.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No upcoming stays.</li>
          ) : (
            upcoming.map((r) => (
              <li key={r.id} className="flex justify-between py-3 text-sm">
                <span>{r.guest_name}</span>
                <span className="text-slate-500">
                  {r.start_date} → {r.end_date}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
