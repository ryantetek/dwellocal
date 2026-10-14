import { Link } from "react-router-dom";
import { DwellocalLogo } from "@/components/DwellocalLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-dwell-sand bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12 lg:px-8 md:grid md:grid-cols-3 md:items-center">
        <p className="order-2 text-base text-dwell-muted md:order-1 md:justify-self-start">
          © {new Date().getFullYear()} Dwellocal
        </p>
        <div className="order-1 md:order-2 md:justify-self-center">
          <Link to="/" aria-label="Dwellocal home">
            <DwellocalLogo size="lg" />
          </Link>
        </div>
        <nav className="order-3 flex gap-8 text-base text-dwell-muted md:justify-self-end">
          <Link to="/terms" className="hover:text-dwell-charcoal">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-dwell-charcoal">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
