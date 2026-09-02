"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoogleAnalytics from "@/components/GoogleAnalytics";

type ConsentState = "unknown" | "granted" | "denied";

export default function ConsentGate() {
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("cookie-consent");
    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
    }
    setChecked(true);
  }, []);

  function respond(value: "granted" | "denied") {
    window.localStorage.setItem("cookie-consent", value);
    setConsent(value);
  }

  return (
    <>
      {consent === "granted" && <GoogleAnalytics />}

      {checked && consent === "unknown" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-charcoal/70 max-w-xl">
              We use cookies for basic analytics (page views, which
              calculators get used) to improve the site. No ads run on
              Salary-Tools yet. See our{" "}
              <Link href="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => respond("denied")}
                className="px-4 py-2 rounded-lg text-sm border border-slate-300 text-charcoal/70 bg-white"
              >
                Decline
              </button>
              <button
                onClick={() => respond("granted")}
                className="px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
