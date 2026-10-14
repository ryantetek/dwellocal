import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  LayoutTemplate,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { FadeIn } from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATE_META } from "@/lib/templates";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const HERO =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80";

const features = [
  {
    icon: LayoutTemplate,
    title: "Public landing page",
    copy: "A one-page showcase for each property — photography, amenities, house rules, and enquiries.",
  },
  {
    icon: ShieldCheck,
    title: "Admin dashboard",
    copy: "A private host portal for occupancy, content, messages, and the books — without payment processors.",
  },
  {
    icon: CalendarDays,
    title: "Reservation calendar",
    copy: "Month view with multi-day stays, guest details, and a unique guest-guide QR for each booking.",
  },
  {
    icon: Wallet,
    title: "Income & expense ledgers",
    copy: "Simple, manual accounting so you can see the house clearly. No live payment rails.",
  },
  {
    icon: LayoutTemplate,
    title: "Switchable templates",
    copy: "Classic, Modern, and Coastal included. Pro unlocks Editorial, Minimal, Luxe, Nordic, Heritage, Tropic.",
  },
  {
    icon: MessageCircle,
    title: "Guest messaging",
    copy: "An enquiry widget on the public page, with a quiet inbox in admin for replies.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          data: { property_name: propertyName, full_name: propertyName },
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
    <div className="min-h-screen bg-dwell-beige text-dwell-charcoal">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled ? "border-b border-dwell-sand/70 bg-dwell-beige/80 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="Dwellocal home">
            <DwellocalLogo inverted={!scrolled} showTagline={false} />
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {[
              ["Features", "#features"],
              ["Templates", "#templates"],
              ["Demo", "#demo"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={cn("transition-opacity hover:opacity-80", scrolled ? "text-dwell-charcoal" : "text-white")}
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className={cn("transition-opacity hover:opacity-80", scrolled ? "text-dwell-charcoal" : "text-white")}
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <a href="#signup">Get started</a>
            </Button>
          </nav>
          <Button asChild size="sm" className="md:hidden">
            <a href="#signup">Get started</a>
          </Button>
        </div>
      </header>

      <section className="relative min-h-[92vh] overflow-hidden">
        <motion.img
          src={HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-dwell-beige" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-24 pt-32">
          <FadeIn>
            <Badge className="bg-white/15 text-white backdrop-blur-sm">Property Management, Simplified.</Badge>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.1] text-white drop-shadow-sm md:text-6xl">
              Your property. Your page. Your platform.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              A beautiful public showcase for each property, and a powerful private dashboard for reservations,
              accounting, content, and enquiries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#signup">Get Started</a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#features">See How It Works</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/75">Free to start · No card required · No payment processing</p>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-dwell-sand/80 bg-white/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
          {[
            { icon: QrCode, label: "QR Guest Guide" },
            { icon: CalendarDays, label: "Reservation calendar" },
            { icon: Wallet, label: "Income & expense ledgers" },
            { icon: ShieldCheck, label: "Built for hosts" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm text-dwell-muted">
              <item.icon className="h-5 w-5 text-dwell-deep" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <FadeIn>
          <p className="text-sm uppercase tracking-[0.18em] text-dwell-muted">Features</p>
          <h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">Everything a host actually needs</h2>
        </FadeIn>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.05}>
              <div className="h-full rounded-[16px] border border-dwell-sand bg-white p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <feature.icon className="h-6 w-6 text-dwell-deep" />
                <h3 className="mt-4 font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dwell-muted">{feature.copy}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="templates" className="bg-white/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <p className="text-sm uppercase tracking-[0.18em] text-dwell-muted">Templates</p>
            <h2 className="mt-2 font-heading text-3xl font-bold">A look that fits the house</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_META.map((tpl) => (
              <div key={tpl.id} className="overflow-hidden rounded-[16px] border border-dwell-sand bg-white">
                <img src={tpl.preview} alt="" className="h-44 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold">{tpl.name}</h3>
                    {tpl.tier === "free" ? (
                      <Badge>Included</Badge>
                    ) : (
                      <Button asChild size="sm">
                        <Link to="/upgrade">Upgrade</Link>
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-dwell-muted">{tpl.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[16px] bg-dwell-deep px-8 py-14 text-white md:px-14">
          <p className="text-sm uppercase tracking-[0.18em] text-dwell-sage">Demo</p>
          <h2 className="mt-2 font-heading text-3xl font-bold">Walk through a property without signing up</h2>
          <p className="mt-3 max-w-xl text-white/80">
            Read-only sample pages — the public showcase, the host dashboard, and a guest guide. Nothing you click
            will save.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/demo/property">Demo frontend</Link>
            </Button>
            <Button asChild className="bg-white text-dwell-deep hover:bg-dwell-beige">
              <Link to="/demo/admin">Demo backend</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/demo">Demo overview</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="signup" className="mx-auto max-w-xl px-5 py-24">
        <FadeIn>
          <p className="text-sm uppercase tracking-[0.18em] text-dwell-muted">Get started</p>
          <h2 className="mt-2 font-heading text-3xl font-bold">Create your property</h2>
          <p className="mt-3 text-dwell-muted">
            Email, Google, or Facebook. After verification, we seed a starter page. New accounts wait for a short
            manual approval.
          </p>
          <form onSubmit={handleSignup} className="mt-8 space-y-4 rounded-[16px] border border-dwell-sand bg-white p-6">
            <div>
              <Label htmlFor="propertyName">Property name</Label>
              <Input id="propertyName" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} required />
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
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating…" : "Create property"}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => void oauth("google")}>
                Google
              </Button>
              <Button type="button" variant="outline" onClick={() => void oauth("facebook")}>
                Facebook
              </Button>
            </div>
          </form>
        </FadeIn>
      </section>

      <footer className="border-t border-dwell-sand bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <DwellocalLogo showTagline />
          <div className="flex gap-6 text-sm text-dwell-muted">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
          <p className="text-sm text-dwell-muted">© {new Date().getFullYear()} Dwellocal</p>
        </div>
      </footer>
    </div>
  );
}
