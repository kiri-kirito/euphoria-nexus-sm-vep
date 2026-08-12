interface DbErrorBannerProps {
  message: string;
  className?: string;
}

export default function DbErrorBanner({ message, className = '' }: DbErrorBannerProps) {
  return (
    <div
      className={`bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 rounded-xl ${className}`}
      role="alert"
    >
      <strong className="font-semibold">Could not load live data.</strong> {message}
    </div>
  );
}
