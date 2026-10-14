import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RESERVED_SLUGS = new Set([
  "admin",
  "demo",
  "login",
  "register",
  "verify",
  "terms",
  "privacy",
  "forgot-password",
  "reset-password",
  "pending-approval",
  "after-login",
  "upgrade",
  "super-admin",
  "guide",
  "api",
  "app",
]);

export function slugifyLive(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "");
}

export function slugify(value: string) {
  return slugifyLive(value).replace(/-+$/g, "").trim();
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function randomToken(length = 24) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  crypto.getRandomValues(new Uint8Array(length)).forEach((n) => {
    out += alphabet[n % alphabet.length];
  });
  return out;
}
