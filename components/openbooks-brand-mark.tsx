type OpenBooksBrandMarkProps = {
  size?: number;
  light?: boolean;
};

/**
 * Shared OpenBooks brand artwork.
 * Uses the exact logo uploaded to /public rather than a hand-built SVG mark.
 */
export function OpenBooksBrandMark({ size = 34 }: OpenBooksBrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src="/OPENBOOKS_LOGO.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
