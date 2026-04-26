/**
 * Hasker & Co. Realty Group — SVG wordmark component.
 * Icon: diamond house mark (same geometry as hasker-icon.html) inside a navy circle.
 * Text: "HASKER & CO." bold + "REALTY GROUP" spaced below.
 *
 * variant="on-white"  → dark navy wordmark  (nav on white background)
 * variant="on-dark"   → white wordmark       (footer, transparent hero nav)
 */
export function HaskerLogo({
  variant = "on-white",
  height = 36,
}: {
  variant?: "on-white" | "on-dark";
  height?: number;
}) {
  const textColor = variant === "on-dark" ? "#FFFFFF" : "#0B1F3A";
  const width = Math.round(height * (192 / 44));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 192 44"
      width={width}
      height={height}
      role="img"
      aria-label="Hasker &amp; Co. Realty Group"
    >
      {/* ── Icon circle ─────────────────────────────── */}
      <circle cx="22" cy="22" r="22" fill="#0B1F3A" />

      {/*
        House mark — original coords live in a 320×320 coordinate space,
        centered at (160,160). We translate the origin to (160,160), scale
        down so the mark fits snugly inside the 44-unit circle, then
        re-place the result at (22,22) — the center of our icon area.
        Scale = 36 / 208  ≈ 0.173  (208 = full diamond height in source).
      */}
      <g transform="translate(22,22) scale(0.173) translate(-160,-160)">
        {/* Outer diamond (house silhouette) */}
        <polygon points="76,160 160,56 244,160 160,264" fill="#1A56DB" />
        {/* Roof cutout */}
        <polygon points="120,160 160,104 200,160" fill="#FFFFFF" />
        {/* Body */}
        <rect x="124" y="160" width="72" height="50" rx="4" fill="#FFFFFF" />
        {/* Door */}
        <rect x="146" y="170" width="28" height="40" rx="4" fill="#1A56DB" />
      </g>

      {/* ── Wordmark ─────────────────────────────────── */}
      {/* Company name */}
      <text
        x="53"
        y="20"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="17"
        fill={textColor}
        letterSpacing="-0.2"
      >
        {"HASKER & CO."}
      </text>

      {/* Descriptor */}
      <text
        x="54"
        y="33.5"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontWeight="400"
        fontSize="8.5"
        fill="#1A56DB"
        letterSpacing="2.6"
      >
        REALTY GROUP
      </text>
    </svg>
  );
}
