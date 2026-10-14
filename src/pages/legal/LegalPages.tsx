import { Link } from "react-router-dom";
import { DwellocalLogo } from "@/components/DwellocalLogo";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dwell-beige">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link to="/">
          <DwellocalLogo />
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-5 pb-20">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-dwell-muted">{children}</div>
      </article>
    </div>
  );
}

export function TermsPage() {
  return (
    <Shell title="Terms of use">
      <p>
        Dwellocal is a property showcase and host operations tool. Accounting is a manual ledger only. There is no
        payment processing, and no live third-party booking engine is connected yet.
      </p>
      <p>
        New accounts remain pending until a Super Admin approves access. You are responsible for the accuracy of
        guest-facing content, including access codes in guest guides.
      </p>
    </Shell>
  );
}

export function PrivacyPage() {
  return (
    <Shell title="Privacy">
      <p>
        We store the account details you provide, property content you publish, and guest enquiry messages submitted
        through public pages. Analytics identifiers (GA4 / GTM) are optional and injected only if you set them.
      </p>
      <p>
        Guest guide tokens are unique and intended to expire with a stay. Do not share wifi or door codes on the
        public page.
      </p>
    </Shell>
  );
}
