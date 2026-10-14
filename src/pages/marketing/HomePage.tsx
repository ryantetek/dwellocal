import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ImageIcon,
  LayoutTemplate,
  Link2,
  Mail,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATE_META } from "@/lib/templates";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { RESERVED_SLUGS, slugify, slugifyLive } from "@/lib/utils";

const PRODUCT =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

const steps = [
  {
    n: "01",
    title: "Tell us the property name",
    copy: "That’s it to begin. We start a page you can fill in, like a simple photo album with words.",
  },
  {
    n: "02",
    title: "Add photos and property notes",
    copy: "Pictures, what the property has, the stay rules, and a form so people can ask about dates.",
  },
  {
    n: "03",
    title: "Use it when guests stay",
    copy: "See who’s coming, share a welcome sheet for arrivals, and jot down money in and money out.",
  },
];

const workspacePoints = [
  { icon: Mail, text: "Sign up with email, Google, or Facebook — whichever you already use" },
  { icon: LayoutTemplate, text: "We start a page for your property. You add photos and words when you’re ready" },
  { icon: ShieldCheck, text: "A person on our team checks new accounts before they go live" },
  { icon: ImageIcon, text: "Change photos, stay rules, and check-in notes without a web designer" },
  { icon: CalendarDays, text: "See who’s staying, and on which days, on a simple calendar" },
  { icon: Wallet, text: "Keep a record of money in and money out. We never take guest payments" },
  { icon: Link2, text: "Share one link. Guests don’t need an app" },
];

export function HomePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const host = typeof window !== "undefined" ? window.location.host : "dwellocal.com";
  const previewSlug = slugify(slug) || "your-address";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const webAddress = slugify(slug);
    if (!webAddress) {
      setError("Choose a web address for your property page.");
      return;
    }
    if (RESERVED_SLUGS.has(webAddress)) {
      setError("That web address is reserved. Please choose another.");
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError("Connect Supabase to create an account. You can explore the demo in the meantime.");
      return;
    }
    setBusy(true);
    try {
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { property_name: propertyName, property_slug: webAddress, full_name: propertyName },
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });
      if (signError) throw signError;
      navigate("/verify", { state: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start signup");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "facebook") {
    if (!supabase) {
      setError("Connect Supabase to use social login.");
      return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/after-login` },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-dwell-charcoal">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 pb-24 pt-36 lg:px-8 md:pb-32 md:pt-44">
        <div className="pointer-events-none absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-dwell-sage/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-dwell-sand/80 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <FadeIn>
            <Badge className="px-4 py-1.5 text-sm">Property Management, Simplified.</Badge>
            <h1 className="mt-7 font-heading text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Your space, online —
              <span className="block text-dwell-deep">without the fuss.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-dwell-muted md:text-2xl md:leading-snug">
              Guests get a beautiful page with photos, stay rules, and a way to ask about dates. You get one calm
              place to keep bookings, messages, and a simple money list. No website skills needed.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="xl">
                <a href="#signup">Start free</a>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/demo">
                  Try a sample property <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-base text-dwell-muted">
              {["Free to start", "No card needed", "We never take guest payments"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-dwell-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={reduce ? 0 : 0.08}>
            <div className="rounded-[28px] border border-dwell-sand bg-white p-3 shadow-[0_32px_90px_-32px_rgba(23,26,25,0.4)]">
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="h-3.5 w-3.5 rounded-full bg-dwell-sand" />
                <span className="h-3.5 w-3.5 rounded-full bg-dwell-sand" />
                <span className="h-3.5 w-3.5 rounded-full bg-dwell-sage" />
                <span className="ml-3 rounded-full bg-dwell-beige px-4 py-1 text-sm text-dwell-muted">
                  dwellocal.com/cedar-salt-house
                </span>
              </div>
              <img
                src={PRODUCT}
                alt="A sample property page"
                className="h-80 w-full rounded-[20px] object-cover md:h-[28rem]"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-dwell-sand bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-4 lg:px-8">
          {[
            ["Property page", "Photos and details for guests"],
            ["Calendar", "Who is staying, and when"],
            ["Financial tracker", "What came in and what went out"],
            ["Welcome Guide", "Stay information in a QR code "],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="font-heading text-xl font-semibold">{k}</p>
              <p className="mt-2 text-base text-dwell-muted">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <FadeIn>
          <p className="text-base uppercase tracking-[0.18em] text-dwell-muted">How it works</p>
          <h2 className="mt-3 font-heading text-4xl font-bold md:text-5xl">Three simple steps</h2>
        </FadeIn>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.05}>
              <div className="h-full rounded-[24px] border border-dwell-sand bg-white p-8 md:p-10">
                <p className="font-heading text-lg text-dwell-green">{step.n}</p>
                <h3 className="mt-4 font-heading text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-dwell-muted">{step.copy}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="product" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeIn>
            <p className="text-base uppercase tracking-[0.18em] text-dwell-muted">What you get</p>
            <h2 className="mt-3 max-w-3xl font-heading text-4xl font-bold md:text-5xl">
              Built around your property, not a booking website
            </h2>
          </FadeIn>
          <div className="mt-16 grid gap-6 md:grid-cols-6">
            {[
              {
                icon: LayoutTemplate,
                title: "A public property page",
                copy: "Photos, what the property has, stay rules, and a form to ask about staying.",
                span: "md:col-span-3",
              },
              {
                icon: ShieldCheck,
                title: "A private host area",
                copy: "See occupancy, edit your page, read messages, and keep the books.",
                span: "md:col-span-3",
              },
              {
                icon: CalendarDays,
                title: "Stay calendar",
                copy: "Mark who is coming and for how many nights.",
                span: "md:col-span-2",
              },
              {
                icon: Wallet,
                title: "Money notebook",
                copy: "Income and expenses, written by you. No card machines.",
                span: "md:col-span-2",
              },
              {
                icon: QrCode,
                title: "Arrival guide",
                copy: "Wifi and door access, house rules and other info — on a QR code.",
                span: "md:col-span-2",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.04} className={item.span}>
                <div className="h-full rounded-[24px] border border-dwell-sand bg-[#FAF8F3] p-8 md:p-10">
                  <item.icon className="h-8 w-8 text-dwell-deep" />
                  <h3 className="mt-6 font-heading text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-dwell-muted">{item.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <FadeIn>
          <p className="text-base uppercase tracking-[0.18em] text-dwell-muted">Looks</p>
          <h2 className="mt-3 font-heading text-4xl font-bold md:text-5xl">A look that fits the property</h2>
        </FadeIn>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {TEMPLATE_META.filter((tpl) => tpl.tier === "free").map((tpl) => (
            <div key={tpl.id} className="overflow-hidden rounded-[24px] border border-dwell-sand bg-white">
              <img src={tpl.preview} alt="" className="h-56 w-full bg-dwell-sand object-cover" />
              <div className="p-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-2xl font-semibold">{tpl.name}</h3>
                  <Badge>Included</Badge>
                </div>
                <p className="mt-3 text-base text-dwell-muted">{tpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[28px] bg-dwell-deep px-10 py-16 text-white md:flex-row md:items-center md:px-14">
          <div>
            <p className="text-base uppercase tracking-[0.18em] text-dwell-sage">Have a look first</p>
            <h2 className="mt-3 font-heading text-4xl font-bold md:text-5xl">Try a sample property</h2>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Open the guest page, the host area, and the arrival guide. Nothing is saved.
            </p>
          </div>
          <Button asChild size="xl" className="bg-white text-dwell-deep hover:bg-dwell-beige">
            <Link to="/demo">Open the demo</Link>
          </Button>
        </div>
      </section>

      <section id="signup" className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="text-base uppercase tracking-[0.18em] text-dwell-muted">Get started</p>
          <h2 className="mt-3 font-heading text-4xl font-bold md:text-5xl">Create your workspace</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-dwell-muted">
            Use email, Google, or Facebook. After you confirm your email, we start a page for your property. New
            accounts wait for a short check from our team so the site stays calm and genuine.
          </p>
          <ul className="mt-10 space-y-4 text-base text-dwell-muted">
            {workspacePoints.map((item) => (
              <li key={item.text} className="flex gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-dwell-deep" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <form
          onSubmit={handleSignup}
          className="space-y-5 rounded-[24px] border border-dwell-sand bg-white p-8 shadow-sm md:p-10"
        >
          <div>
            <Label htmlFor="propertyName">Property name</Label>
            <Input
              id="propertyName"
              value={propertyName}
              placeholder="Sunset Beach Villa"
              onChange={(e) => {
                const next = e.target.value;
                setPropertyName(next);
                if (!slugEdited) setSlug(slugifyLive(next));
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="webAddress">Web address</Label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dwell-muted" />
              <Input
                id="webAddress"
                className="pl-9"
                value={slug}
                placeholder="sunset-beach-villa"
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(slugifyLive(e.target.value));
                }}
                required
              />
            </div>
            <p className="mt-2 text-sm text-dwell-muted">
              Your page will live at{" "}
              <span className="font-medium text-dwell-charcoal">
                {host}/{previewSlug}
              </span>
            </p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" size="xl" disabled={busy}>
            {busy ? "Creating…" : "Create my property page"}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => void oauth("google")}>
              Google
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => void oauth("facebook")}>
              Facebook
            </Button>
          </div>
        </form>
      </section>

      <SiteFooter />
    </div>
  );
}
