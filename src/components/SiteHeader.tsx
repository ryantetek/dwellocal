import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HEADER_OFFSET = 96;

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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goToSection(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    event.preventDefault();
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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-dwell-sand/80 bg-white/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link to="/" aria-label="Dwellocal home">
          <DwellocalLogo size="lg" />
        </Link>
        <nav className="hidden items-center gap-8 text-base text-dwell-muted md:flex">
          <a href="/#product" className="hover:text-dwell-charcoal" onClick={(e) => goToSection(e, "#product")}>
            Product
          </a>
          <a href="/#how" className="hover:text-dwell-charcoal" onClick={(e) => goToSection(e, "#how")}>
            How it works
          </a>
          <a href="/#templates" className="hover:text-dwell-charcoal" onClick={(e) => goToSection(e, "#templates")}>
            Templates
          </a>
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
        <Button asChild size="lg" className="md:hidden">
          <a href="/#signup" onClick={(e) => goToSection(e, "#signup")}>
            Get started
          </a>
        </Button>
      </div>
    </header>
  );
}
