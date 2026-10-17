import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { DwellocalLogo } from "@/components/DwellocalLogo";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { SOCIAL_AUTH_ENABLED, clearPendingProperty, readPendingProperty } from "@/lib/oauth";
import { createPropertyWithSeed } from "@/lib/seed";
import { supabase } from "@/lib/supabase";

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dwell-beige px-5 py-16">
      <div className="w-full max-w-md rounded-[16px] border border-dwell-sand bg-white p-8">
        <DwellocalLogo showTagline />
        <h1 className="mt-6 font-heading text-2xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;

  if (user) return <Navigate to="/after-login" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    navigate(from || "/after-login");
  }

  return (
    <AuthShell title="Log in">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>
      {SOCIAL_AUTH_ENABLED ? (
        <>
          <p className="my-4 text-center text-xs uppercase tracking-[0.14em] text-dwell-muted">or</p>
          <SocialAuthButtons onError={setError} />
        </>
      ) : null}
      <p className="mt-4 text-sm text-dwell-muted">
        <Link to="/forgot-password" className="underline">
          Forgot password
        </Link>
        {" · "}
        <Link to="/#signup" className="underline">
          Get started
        </Link>
      </p>
    </AuthShell>
  );
}

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Supabase is not configured.");
    setBusy(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (verifyError || !data.user) {
      setBusy(false);
      setError(verifyError?.message ?? "Verification failed");
      return;
    }
    const propertyName = (data.user.user_metadata?.property_name as string | undefined) || "My property";
    const propertySlug = data.user.user_metadata?.property_slug as string | undefined;
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id);
    if (!count) {
      try {
        await createPropertyWithSeed({ userId: data.user.id, name: propertyName, slug: propertySlug });
      } catch {
        /* profile trigger may still be settling */
      }
    }
    setBusy(false);
    navigate("/after-login");
  }

  return (
    <AuthShell title="Verify your email">
      <p className="mb-4 text-sm text-dwell-muted">Enter the one-time code sent to {email || "your inbox"}.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button className="w-full" disabled={busy}>
          {busy ? "Verifying…" : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Supabase is not configured.");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else setDone(true);
  }

  return (
    <AuthShell title="Forgot password">
      {done ? (
        <p className="text-sm text-dwell-muted">Check your email for a reset link.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Supabase is not configured.");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else navigate("/login");
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
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
        <Button className="w-full">Update password</Button>
      </form>
    </AuthShell>
  );
}

function VerificationWait({
  title,
  rejected,
}: {
  title: string;
  rejected?: boolean;
}) {
  const { signOut, refreshProfile } = useAuth();

  useEffect(() => {
    if (rejected) return;
    const tick = window.setInterval(() => {
      void refreshProfile();
    }, 8000);
    return () => window.clearInterval(tick);
  }, [refreshProfile, rejected]);

  return (
    <AuthShell title={title}>
      <p className="text-sm leading-relaxed text-dwell-muted">
        {rejected
          ? "This account was not approved. Contact support if you believe this is a mistake."
          : "Your email is signed in, but a Super Admin has not enabled this account yet. The verification process is still ongoing. You can leave this page open — it will continue automatically once you are approved."}
      </p>
      <Button className="mt-6 w-full" variant="outline" onClick={() => void signOut()}>
        Sign out
      </Button>
    </AuthShell>
  );
}

export function PendingApprovalPage() {
  const { profile, extrasReady } = useAuth();
  if (extrasReady && profile?.status === "approved") {
    return <Navigate to="/after-login" replace />;
  }
  return (
    <VerificationWait
      title="Verification still ongoing"
      rejected={profile?.status === "rejected"}
    />
  );
}

export function AfterLoginPage() {
  const { ready, extrasReady, user, profile, isSuperAdmin } = useAuth();
  const [checked, setChecked] = useState(false);
  const [hasProperty, setHasProperty] = useState(false);
  const awaitingApproval =
    profile?.status === "pending" ||
    profile?.status === "rejected" ||
    (extrasReady && Boolean(user) && !profile && !isSuperAdmin);

  useEffect(() => {
    if (!ready || !user || isSuperAdmin || awaitingApproval) return;
    if (!supabase) {
      setChecked(true);
      return;
    }
    void (async () => {
      const { count } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!count) {
        const pending = readPendingProperty();
        if (pending?.name) {
          try {
            await createPropertyWithSeed({ userId: user.id, name: pending.name, slug: pending.slug });
            clearPendingProperty();
            setHasProperty(true);
            setChecked(true);
            return;
          } catch {
            /* onboarding can finish the rest */
          }
        }
      }
      setHasProperty(Boolean(count));
      setChecked(true);
    })();
  }, [awaitingApproval, isSuperAdmin, profile?.status, ready, user]);

  if (!user && !ready) {
    return (
      <AuthShell title="Signing you in">
        <p className="text-sm leading-relaxed text-dwell-muted">Checking your session…</p>
      </AuthShell>
    );
  }
  if (ready && !user) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/super-admin" replace />;
  if (user && !extrasReady && profile?.status !== "approved") {
    return <VerificationWait title="Verification still ongoing" />;
  }
  if (awaitingApproval) return <Navigate to="/pending-approval" replace />;
  if (!checked) {
    return (
      <AuthShell title="Preparing your workspace">
        <p className="text-sm leading-relaxed text-dwell-muted">Opening your property workspace…</p>
      </AuthShell>
    );
  }
  if (!hasProperty) return <Navigate to="/admin/onboarding" replace />;
  return <Navigate to="/admin" replace />;
}

export function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user && isSuperAdmin) return <Navigate to="/super-admin" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Supabase is not configured.");
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) setError(signError.message);
    else navigate("/super-admin");
  }

  return (
    <AuthShell title="Super Admin">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button className="w-full">Enter</Button>
      </form>
    </AuthShell>
  );
}
