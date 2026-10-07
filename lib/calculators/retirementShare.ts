// Shareable links: the calculator's inputs are stored in the URL as a
// compact base64url string under ?s=. Only inputs that differ from the
// defaults are stored, so links stay short. Nothing is sent to a server.

import {
  DEFAULT_INPUTS,
  type RetirementInputs,
} from "@/lib/calculators/retirementBenefits";

const PARAM = "s";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeInputs(inputs: RetirementInputs): string {
  const diff: Partial<RetirementInputs> = {};
  (Object.keys(inputs) as (keyof RetirementInputs)[]).forEach((key) => {
    if (inputs[key] !== DEFAULT_INPUTS[key]) {
      (diff as Record<string, unknown>)[key] = inputs[key];
    }
  });
  return toBase64Url(JSON.stringify(diff));
}

// Accepts only known keys with the same type as the default, so a
// hand-edited link can't inject unexpected values.
export function decodeInputs(encoded: string): RetirementInputs | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as Record<string, unknown>;
    const result: RetirementInputs = { ...DEFAULT_INPUTS };
    (Object.keys(DEFAULT_INPUTS) as (keyof RetirementInputs)[]).forEach((key) => {
      const value = parsed[key];
      if (value !== undefined && typeof value === typeof DEFAULT_INPUTS[key]) {
        (result as unknown as Record<string, unknown>)[key] = value;
      }
    });
    return result;
  } catch {
    return null;
  }
}

export function readInputsFromUrl(): RetirementInputs | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(PARAM);
  return value ? decodeInputs(value) : null;
}

export function buildShareUrl(inputs: RetirementInputs): string {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, encodeInputs(inputs));
  return url.toString();
}
