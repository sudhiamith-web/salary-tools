export default function Badge({
  children,
  variant = "outline",
}: {
  children: React.ReactNode;
  variant?: "filled" | "outline";
}) {
  return (
    <span
      className={
        variant === "filled"
          ? "inline-block bg-ink text-paper text-xs px-3 py-1 rounded-full"
          : "inline-block bg-white text-charcoal/70 text-xs px-3 py-1 rounded-full border border-ink/15"
      }
    >
      {children}
    </span>
  );
}
