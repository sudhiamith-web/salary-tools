export default function InsightBanner({
  message,
  linkLabel,
  onLinkClick,
}: {
  message: string;
  linkLabel?: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className="insight-banner">
      <span>{message}</span>
      {linkLabel && (
        <button onClick={onLinkClick} className="text-accent font-medium whitespace-nowrap">
          {linkLabel} ›
        </button>
      )}
    </div>
  );
}
