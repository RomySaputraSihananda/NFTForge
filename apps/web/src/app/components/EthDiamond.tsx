export function EthDiamond({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 12.5L12 16L20 12.5L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 16L4 12.5L12 22L20 12.5L12 16Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path d="M12 2L12 16L20 12.5L12 2Z" fill="currentColor" opacity="0.4" />
      <path d="M12 16L12 22L20 12.5L12 16Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}