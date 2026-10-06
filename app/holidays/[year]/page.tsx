import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import HolidayHub from "@/components/compliance/HolidayHub";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";

export const revalidate = REVALIDATE_SECONDS;

function parseYear(raw: string): number | null {
  const y = Number(raw);
  return Number.isInteger(y) && y >= 2025 && y <= 2100 ? y : null;
}

export function generateMetadata({ params }: { params: { year: string } }): Metadata {
  const year = parseYear(params.year);
  if (!year) return {};
  return {
    title: `Holiday List ${year}: All States & UTs, Government and Private Employers`,
    description: `State-wise holiday list ${year} for all 36 states and UTs, with the paid holidays private employers must give under state law.`,
    alternates: { canonical: `/holidays/${year}` },
  };
}

export default function HolidaysYearPage({ params }: { params: { year: string } }) {
  const year = parseYear(params.year);
  if (!year) notFound();
  // The current year lives at /holidays; keep one URL per page.
  if (year === new Date().getFullYear()) permanentRedirect("/holidays");
  return <HolidayHub year={year} />;
}
