import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  CreditCard,
  Home,
  ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Settings,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { DemoRibbon } from "@/components/DemoRibbon";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "cms", icon: Home, label: "CMS" },
  { to: "messages", icon: MessageSquare, label: "Messages" },
  { to: "gallery", icon: ImageIcon, label: "Gallery" },
  { to: "calendar", icon: CalendarDays, label: "Calendar" },
  { to: "income", icon: Wallet, label: "Income" },
  { to: "expenses", icon: CreditCard, label: "Expenses" },
  { to: "templates", icon: LayoutTemplate, label: "Templates" },
  { to: "settings", icon: Settings, label: "Settings" },
  { to: "support", icon: LifeBuoy, label: "Support" },
  { to: "upgrade", icon: Camera, label: "Upgrade" },
];

export function AdminLayout() {
  const { signOut, plan } = useAuth();
  const { isDemo } = useDemo();
  const { properties, current, setCurrentId } = useProperties();
  const location = useLocation();
  const navigate = useNavigate();
  const base = isDemo ? "/demo/admin" : "/admin";
  const items = nav.filter((item) => !(isDemo && item.to === "upgrade"));

  return (
    <div className="admin-scope flex min-h-screen">
      {isDemo ? <DemoRibbon /> : null}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="px-5 py-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Host portal</p>
          <DwellocalLogo className="mt-2" markClassName="h-8 w-8" />
        </div>
        {isDemo ? (
          <div className="mx-4 mb-3 rounded-[12px] bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Read-only demo. Saving is disabled.
          </div>
        ) : null}
        <label className="px-4 text-xs text-slate-500">Property</label>
        <select
          className="mx-4 mb-4 mt-1 h-10 rounded-[12px] border border-slate-200 bg-slate-50 px-2 text-sm"
          value={current?.id ?? ""}
          onChange={(e) => setCurrentId(e.target.value)}
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {!isDemo && properties.length < plan.propertyLimit ? (
          <Link to="/admin/onboarding" className="mx-4 mb-4 text-xs text-slate-600 underline">
            Add property
          </Link>
        ) : null}
        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to ? `${base}/${item.to}` : base}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-[12px] px-3 py-2 text-sm text-slate-600 hover:bg-slate-50",
                  isActive && "bg-slate-100 font-medium text-slate-900",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-slate-200 p-4">
          {current ? (
            <Link
              to={isDemo ? "/demo/property" : `/${current.slug}`}
              className="block text-sm text-slate-600 hover:underline"
              target="_blank"
            >
              View public site
            </Link>
          ) : null}
          {isDemo ? (
            <Link to="/demo" className="block text-sm text-slate-600 hover:underline">
              Exit demo
            </Link>
          ) : (
            <button type="button" onClick={() => void signOut()} className="flex items-center gap-2 text-sm text-slate-600">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <p className="font-heading font-semibold">Admin</p>
            <p className="truncate text-xs text-slate-500">{location.pathname}</p>
          </div>
          <select
            className="mt-3 h-10 w-full rounded-[12px] border border-slate-200 bg-slate-50 px-2 text-sm"
            value={location.pathname}
            onChange={(e) => navigate(e.target.value)}
          >
            {items.map((item) => {
              const href = item.to ? `${base}/${item.to}` : base;
              return (
                <option key={href} value={href}>
                  {item.label}
                </option>
              );
            })}
          </select>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
