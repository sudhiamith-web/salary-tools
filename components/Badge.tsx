export default function Badge({
  children,
  variant = "outline",
}: {
  children: React.ReactNode;
  variant?: "filled" | "outline" | "success" | "warn";
}) {
  const styles = {
    filled: "bg-accent text-white",
    outline: "bg-white text-charcoal/70 border border-slate-300",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border border-amber-200",
  }[variant];

  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${styles}`}>
      {children}
    </span>
  );
}
