export default function TapOverlay({ onTap }: { onTap: () => void }) {
  return (
    <div
      className="absolute inset-0 cursor-pointer z-50"
      onClick={onTap}
      onTouchStart={onTap}
    />
  );
}
