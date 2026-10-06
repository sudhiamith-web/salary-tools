// Master list of Indian states and union territories.
// Used by the Sanity schemas (dropdowns), page routing (generateStaticParams)
// and hub grids. Keep imports in this file relative-free so Sanity's CLI
// (Vite) can import it without the "@/..." path alias.

export type RegionKind = "state" | "ut";

export interface Region {
  slug: string;
  code: string;
  name: string;
  kind: RegionKind;
}

export const REGIONS: Region[] = [
  { slug: "andhra-pradesh", code: "AP", name: "Andhra Pradesh", kind: "state" },
  { slug: "arunachal-pradesh", code: "AR", name: "Arunachal Pradesh", kind: "state" },
  { slug: "assam", code: "AS", name: "Assam", kind: "state" },
  { slug: "bihar", code: "BR", name: "Bihar", kind: "state" },
  { slug: "chhattisgarh", code: "CG", name: "Chhattisgarh", kind: "state" },
  { slug: "goa", code: "GA", name: "Goa", kind: "state" },
  { slug: "gujarat", code: "GJ", name: "Gujarat", kind: "state" },
  { slug: "haryana", code: "HR", name: "Haryana", kind: "state" },
  { slug: "himachal-pradesh", code: "HP", name: "Himachal Pradesh", kind: "state" },
  { slug: "jharkhand", code: "JH", name: "Jharkhand", kind: "state" },
  { slug: "karnataka", code: "KA", name: "Karnataka", kind: "state" },
  { slug: "kerala", code: "KL", name: "Kerala", kind: "state" },
  { slug: "madhya-pradesh", code: "MP", name: "Madhya Pradesh", kind: "state" },
  { slug: "maharashtra", code: "MH", name: "Maharashtra", kind: "state" },
  { slug: "manipur", code: "MN", name: "Manipur", kind: "state" },
  { slug: "meghalaya", code: "ML", name: "Meghalaya", kind: "state" },
  { slug: "mizoram", code: "MZ", name: "Mizoram", kind: "state" },
  { slug: "nagaland", code: "NL", name: "Nagaland", kind: "state" },
  { slug: "odisha", code: "OD", name: "Odisha", kind: "state" },
  { slug: "punjab", code: "PB", name: "Punjab", kind: "state" },
  { slug: "rajasthan", code: "RJ", name: "Rajasthan", kind: "state" },
  { slug: "sikkim", code: "SK", name: "Sikkim", kind: "state" },
  { slug: "tamil-nadu", code: "TN", name: "Tamil Nadu", kind: "state" },
  { slug: "telangana", code: "TG", name: "Telangana", kind: "state" },
  { slug: "tripura", code: "TR", name: "Tripura", kind: "state" },
  { slug: "uttar-pradesh", code: "UP", name: "Uttar Pradesh", kind: "state" },
  { slug: "uttarakhand", code: "UK", name: "Uttarakhand", kind: "state" },
  { slug: "west-bengal", code: "WB", name: "West Bengal", kind: "state" },
  { slug: "andaman-nicobar", code: "AN", name: "Andaman & Nicobar Islands", kind: "ut" },
  { slug: "chandigarh", code: "CH", name: "Chandigarh", kind: "ut" },
  { slug: "dadra-nagar-haveli-daman-diu", code: "DD", name: "Dadra & Nagar Haveli and Daman & Diu", kind: "ut" },
  { slug: "delhi", code: "DL", name: "Delhi", kind: "ut" },
  { slug: "jammu-kashmir", code: "JK", name: "Jammu & Kashmir", kind: "ut" },
  { slug: "ladakh", code: "LA", name: "Ladakh", kind: "ut" },
  { slug: "lakshadweep", code: "LD", name: "Lakshadweep", kind: "ut" },
  { slug: "puducherry", code: "PY", name: "Puducherry", kind: "ut" },
];

export const REGION_OPTIONS = REGIONS.map((r) => ({ title: r.name, value: r.slug }));

export function getRegion(slug: string | undefined): Region | undefined {
  if (!slug) return undefined;
  return REGIONS.find((r) => r.slug === slug);
}
