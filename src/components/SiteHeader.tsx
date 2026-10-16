import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HEADER_OFFSET = 96;

const navItems = [
  { href: "/#product", hash: "#product", label: "Product" },
  { href: "/#how", hash: "#how", label: "How it works" },
  { href: "/#templates", hash: "#templates", label: "Templates" },
] as const;

export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  return true;
}

export function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== "/" || !hash) return;
    let tries = 0;
    const tick = () => {
      if (scrollToHash(hash) || tries++ > 24) return;
      requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function goToSection(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    event.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
      scrollToHash(hash);
      return;
    }
    navigate(`/${hash}`);
  }

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        open
          ? "border-b border-dwell-sand/80 bg-white"
          : scrolled
            ? "border-b border-dwell-sand/80 bg-white/95 backdrop-blur-md"
            : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link to="/" aria-label="Dwellocal home" onClick={() => setOpen(false)}>
          <DwellocalLogo size="lg" />
        </Link>
        <nav className="hidden items-center gap-8 text-base text-dwell-muted lg:flex">
          {navItems.map((item) => (
            <a
              key={item.hash}
              href={item.href}
              className="hover:text-dwell-charcoal"
              onClick={(e) => goToSection(e, item.hash)}
            >
              {item.label}
            </a>
          ))}
          <Link to="/demo" className="hover:text-dwell-charcoal">
            Demo
          </Link>
          <Link to="/login" className="hover:text-dwell-charcoal">
            Log in
          </Link>
          <Button asChild size="lg">
            <a href="/#signup" onClick={(e) => goToSection(e, "#signup")}>
              Get started
            </a>
          </Button>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] text-dwell-charcoal hover:bg-dwell-sand/60 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </header>
      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 overflow-y-auto bg-white px-6 pb-10 pt-28 lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.hash}
                href={item.href}
                className="rounded-[12px] px-3 py-3 text-lg text-dwell-charcoal hover:bg-dwell-beige"
                onClick={(e) => goToSection(e, item.hash)}
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/demo"
              className="rounded-[12px] px-3 py-3 text-lg text-dwell-charcoal hover:bg-dwell-beige"
              onClick={() => setOpen(false)}
            >
              Demo
            </Link>
            <Link
              to="/login"
              className="rounded-[12px] px-3 py-3 text-lg text-dwell-charcoal hover:bg-dwell-beige"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Button asChild size="xl" className="mt-6 w-full">
              <a href="/#signup" onClick={(e) => goToSection(e, "#signup")}>
                Get started
              </a>
            </Button>
          </nav>
        </div>
      ) : null}
    </>
  );
}
