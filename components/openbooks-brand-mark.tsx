type OpenBooksBrandMarkProps = {
  size?: number;
  light?: boolean;
};

/**
 * Single source of truth for the OpenBooks brand mark.
 * The repository's uploaded favicon asset is reused here so the same
 * brand artwork appears consistently across navigation and application chrome.
 */
export function OpenBooksBrandMark({ size = 34, light = false }: OpenBooksBrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[20%] ${light ? "drop-shadow-[0_0_1px_rgba(255,255,255,0.2)]" : ""}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/favicon.ico"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
