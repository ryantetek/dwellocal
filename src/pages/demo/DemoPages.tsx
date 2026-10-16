import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, KeyRound, LayoutDashboard, LayoutTemplate } from "lucide-react";
import { GuestGuideView } from "@/components/property/GuestGuideView";
import { TemplateRenderer } from "@/components/property/TemplateRenderer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { demoBundle } from "@/data/demo";

const GUIDE_PATH = "/demo/guide";

const paths = [
  {
    to: "/demo/property",
    kicker: "Guests",
    title: "The property page",
    copy: "What visitors see: photos, stay rules, and an enquire form (turned off in the demo).",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    icon: LayoutTemplate,
    cta: "Open the property page",
  },
  {
    to: "/demo/admin",
    kicker: "Hosts",
    title: "Your private area",
    copy: "Bookings, page editing, photos, and a money list. Saving is turned off here.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    icon: LayoutDashboard,
    cta: "Open the host area",
  },
  {
    to: "/demo/guide",
    kicker: "Arrivals",
    title: "Welcome sheet",
    copy: "Check-in time, wifi, the door code, and stay rules — the page behind a stay’s QR code.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    icon: KeyRound,
    cta: "Open the welcome sheet",
  },
];

export function DemoLandingPage() {
  const guideUrl = typeof window !== "undefined" ? `${window.location.origin}${GUIDE_PATH}` : GUIDE_PATH;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F3] text-dwell-charcoal">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-dwell-sage/40 to-transparent" />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-7xl flex-1 px-6 pb-28 pt-32 lg:px-8 md:pt-36">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div>
            <p className="text-base font-medium text-dwell-deep">Sample property · look around, nothing is saved</p>
            <h1 className="mt-5 font-heading text-5xl font-bold tracking-tight md:text-7xl">
              Click through the same three places your guests and you will use.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-dwell-muted md:text-2xl md:leading-snug">
              Cedar &amp; Salt House is a made-up stay so you can see the product. Start with the property page, then
              your private area, then the welcome sheet for arrivals.
            </p>
          </div>
          <Link
            to={GUIDE_PATH}
            className="hidden rounded-[24px] border border-dwell-sand bg-white p-8 text-center shadow-[0_24px_60px_-40px_rgba(23,26,25,0.5)] transition-transform duration-300 hover:-translate-y-1 lg:flex lg:flex-col lg:items-center"
          >
            <QRCodeSVG value={guideUrl} size={184} bgColor="#FFFFFF" fgColor="#30483B" />
            <p className="mt-5 font-heading text-lg font-semibold">Arrival welcome sheet</p>
            <p className="mt-1 text-sm text-dwell-muted">Scan to open the guest guide</p>
          </Link>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {paths.map((path, index) => (
            <Link
              key={path.to}
              to={path.to}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-dwell-sand bg-white shadow-[0_24px_60px_-40px_rgba(23,26,25,0.5)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden md:h-64">
                <img
                  src={path.image}
                  alt={path.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-dwell-deep">
                  {String(index + 1).padStart(2, "0")} · {path.kicker}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8">
                <div className="flex items-center gap-3 text-dwell-deep">
                  <path.icon className="h-6 w-6" />
                  <h2 className="font-heading text-2xl font-semibold text-dwell-charcoal">{path.title}</h2>
                </div>
                <p className="mt-3 flex-1 text-base leading-relaxed text-dwell-muted">{path.copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-base font-medium text-dwell-deep">
                  {path.cta}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function DemoPropertyPage() {
  return (
    <div>
      <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
        Demo frontend — read only ·{" "}
        <Link to="/demo" className="underline">
          Back to Demo
        </Link>
      </div>
      <TemplateRenderer bundle={demoBundle} showBranding allowCustomScripts={false} readOnly />
    </div>
  );
}

export function DemoGuidePage() {
  return (
    <GuestGuideView
      settings={demoBundle.settings}
      rules={demoBundle.rules}
      guest="Elena Moreau"
      demo
    />
  );
}
