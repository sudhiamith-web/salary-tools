import type { Metadata } from "next";
import HolidayHub from "@/components/compliance/HolidayHub";
import { REVALIDATE_SECONDS } from "@/lib/compliance/sanityFetch";

export const revalidate = REVALIDATE_SECONDS;

const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Holiday List ${YEAR}: All States & UTs, Government and Private Employers`,
  description: `State-wise holiday list ${YEAR} for all 36 states and UTs. Official government holidays, restricted holidays, and the paid holidays private employers must give.`,
  alternates: { canonical: "/holidays" },
};

export default function HolidaysPage() {
  return <HolidayHub year={YEAR} />;
}
