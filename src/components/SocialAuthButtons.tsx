import { Button } from "@/components/ui/button";
import { signInWithSocial } from "@/lib/oauth";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.97-1.07 7.96-2.93l-3.88-3c-1.08.73-2.47 1.16-4.08 1.16-3.14 0-5.8-2.12-6.76-4.97H1.23v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.24 14.26A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.55.38-2.26V6.65H1.23A12 12 0 0 0 0 12c0 1.94.46 3.77 1.23 5.35l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.23 0 12 0 7.31 0 3.26 2.69 1.23 6.65l4.01 3.09C6.2 6.87 8.86 4.75 12 4.75Z"
      />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.96.93-1.96 1.89v2.27h3.34l-.53 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07Z"
      />
    </svg>
  );
}

export function SocialAuthButtons({
  onError,
  beforeSignIn,
  size = "default",
}: {
  onError: (message: string) => void;
  beforeSignIn?: () => boolean | void;
  size?: "default" | "lg";
}) {
  async function oauth(provider: "google" | "facebook") {
    if (beforeSignIn && beforeSignIn() === false) return;
    const { error } = await signInWithSocial(provider);
    if (error) onError(error.message);
  }

  return (
    <div className="grid gap-3">
      <Button type="button" variant="outline" size={size} className="w-full" onClick={() => void oauth("google")}>
        <GoogleLogo className="h-5 w-5 shrink-0" />
        Sign in with Google
      </Button>
      <Button type="button" variant="outline" size={size} className="w-full" onClick={() => void oauth("facebook")}>
        <FacebookLogo className="h-5 w-5 shrink-0" />
        Sign in with Facebook
      </Button>
    </div>
  );
}
