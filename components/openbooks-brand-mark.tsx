type OpenBooksBrandMarkProps = {
  size?: number;
  light?: boolean;
};

export function OpenBooksBrandMark({ size = 34, light = false }: OpenBooksBrandMarkProps) {
  const plum = light ? "#FFFFFF" : "#503047";
  const terracotta = "#C05746";
  const sage = "#ADC698";

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size * 0.86 }}
    >
      <svg viewBox="0 0 128 110" className="h-full w-full overflow-visible">
        <path d="M13 27c16-13 33-14 51-1v68c-18-12-35-11-51 1V27Z" fill={terracotta} />
        <path d="M115 27c-16-13-33-14-51-1v68c18-12 35-11 51 1V27Z" fill={plum} opacity="0.98" />
        <path d="M63 26c-6-9-14-14-23-14" stroke={sage} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M65 27c7-10 17-15 28-15" stroke={sage} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M64 29c1 20 0 38-1 58" stroke={sage} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M88 55h16M88 67h16M88 79h10" stroke={sage} strokeWidth="4" strokeLinecap="round" />
        <text x="86" y="45" fill={plum} fontSize="21" fontWeight="800" fontFamily="Arial, sans-serif">₦</text>
      </svg>
    </span>
  );
}
