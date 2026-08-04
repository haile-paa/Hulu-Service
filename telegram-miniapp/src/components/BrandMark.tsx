export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Hulu Service"
      width={size}
      height={size}
      style={{ borderRadius: size * 0.22, display: "block" }}
    />
  );
}
