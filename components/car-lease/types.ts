import type { CarLeaseInputs } from "@/lib/calculators/carLease";

export interface TabProps {
  inputs: CarLeaseInputs;
  set: <K extends keyof CarLeaseInputs>(key: K) => (value: CarLeaseInputs[K]) => void;
}
