// Purpose-built amenity SVG icons — single-weight stroke, currentColor, 24×24 viewport.
// Designed to match the reference editorial icon style from the Hasker design system.

const SW = 1.8;

function props(size: number, className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: SW,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: size,
    height: size,
    className,
  };
}

export function getAmenityIconSVG(
  name: string,
  size = 20,
  className = ""
): React.JSX.Element {
  const p = props(size, className);
  const n = name.toLowerCase();

  // ── Exterior ─────────────────────────────────────────────────────
  if (/fence|backyard|yard/.test(n))
    return (
      <svg {...p}>
        <path d="M4 21v-9l1.5-2 1.5 2v9z" />
        <path d="M9 21v-9l1.5-2 1.5 2v9z" />
        <path d="M14 21v-9l1.5-2 1.5 2v9z" />
        <path d="M19 21v-9l1.5-2 1.5 2v9z" />
        <line x1="3.5" y1="14.5" x2="20.5" y2="14.5" />
        <line x1="3.5" y1="18" x2="20.5" y2="18" />
      </svg>
    );

  if (/screen.*porch|porch/.test(n))
    return (
      <svg {...p}>
        <path d="M3 11l9-7 9 7" />
        <line x1="5" y1="11" x2="5" y2="20" />
        <line x1="19" y1="11" x2="19" y2="20" />
        <line x1="3" y1="20" x2="21" y2="20" />
        <line x1="10" y1="14" x2="10" y2="20" />
        <line x1="14" y1="14" x2="14" y2="20" />
      </svg>
    );

  if (/garage/.test(n))
    return (
      <svg {...p}>
        <path d="M3 11l9-7 9 7v9h-18z" />
        <rect x="6.5" y="12" width="11" height="8" rx="0.5" />
        <line x1="6.5" y1="15" x2="17.5" y2="15" />
        <line x1="6.5" y1="17.5" x2="17.5" y2="17.5" />
      </svg>
    );

  if (/driveway|parking|car/.test(n))
    return (
      <svg {...p}>
        <path d="M3 13l2-5h14l2 5" />
        <path d="M3 13h18v5h-3l-1-2h-10l-1 2h-3z" />
        <circle cx="7" cy="18" r="1.4" />
        <circle cx="17" cy="18" r="1.4" />
      </svg>
    );

  if (/tree|mature/.test(n))
    return (
      <svg {...p}>
        <path d="M12 3l-4 7h2.5L7 16h3v5h4v-5h3l-3.5-6H17z" />
      </svg>
    );

  // ── Kitchen ──────────────────────────────────────────────────────
  if (/quartz|granite|counter|island/.test(n))
    return (
      <svg {...p}>
        <rect x="3" y="10" width="18" height="3.5" rx="0.5" />
        <line x1="6" y1="13.5" x2="6" y2="20" />
        <line x1="18" y1="13.5" x2="18" y2="20" />
        <line x1="6" y1="20" x2="18" y2="20" />
      </svg>
    );

  if (/stainless|appliance|fridge|refrigerator/.test(n))
    return (
      <svg {...p}>
        <rect x="6.5" y="3" width="11" height="18" rx="1.2" />
        <line x1="6.5" y1="11" x2="17.5" y2="11" />
        <line x1="9" y1="7" x2="9" y2="9" />
        <line x1="9" y1="14" x2="9" y2="17" />
      </svg>
    );

  if (/dishwasher/.test(n))
    return (
      <svg {...p}>
        <rect x="3.5" y="4" width="17" height="16" rx="1.2" />
        <line x1="3.5" y1="9" x2="20.5" y2="9" />
        <line x1="6.5" y1="6.5" x2="8.5" y2="6.5" />
        <line x1="10.5" y1="6.5" x2="14.5" y2="6.5" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        <line x1="7" y1="13" x2="17" y2="13" />
        <line x1="7" y1="16.5" x2="17" y2="16.5" />
      </svg>
    );

  if (/range|stove|burner|gas/.test(n))
    return (
      <svg {...p}>
        <rect x="3.5" y="4" width="17" height="16" rx="1.2" />
        <line x1="3.5" y1="9" x2="20.5" y2="9" />
        <circle cx="8" cy="13" r="1.5" />
        <circle cx="16" cy="13" r="1.5" />
        <circle cx="8" cy="17.5" r="1.5" />
        <circle cx="16" cy="17.5" r="1.5" />
      </svg>
    );

  if (/disposal|sink/.test(n))
    return (
      <svg {...p}>
        <path d="M3 12h18v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <path d="M16 12V7a2 2 0 1 1 4 0" />
        <line x1="9" y1="20" x2="9" y2="21.5" />
        <line x1="15" y1="20" x2="15" y2="21.5" />
      </svg>
    );

  // ── Interior ─────────────────────────────────────────────────────
  if (/hardwood|vinyl|plank|floor|laminate/.test(n))
    return (
      <svg {...p}>
        <rect x="3.5" y="4" width="3.2" height="16" rx="0.4" />
        <rect x="8" y="4" width="3.2" height="16" rx="0.4" />
        <rect x="12.5" y="4" width="3.2" height="16" rx="0.4" />
        <rect x="17" y="4" width="3.2" height="16" rx="0.4" />
      </svg>
    );

  if (/closet|walk.in/.test(n))
    return (
      <svg {...p}>
        <rect x="5" y="3" width="14" height="18" rx="0.8" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <circle cx="10" cy="12" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="14" cy="12" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );

  if (/light|recessed/.test(n))
    return (
      <svg {...p}>
        <path d="M8.5 14a4.5 4.5 0 1 1 7 0c-.5.5-1 1.2-1 2v1H9.5v-1c0-.8-.5-1.5-1-2z" />
        <line x1="10" y1="20.5" x2="14" y2="20.5" />
      </svg>
    );

  if (/ceiling fan|fan/.test(n))
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="1.6" />
        <path d="M12 10.5c0-3 2-5 4-5 1 1-.5 4-4 5z" />
        <path d="M13.5 12c3 0 5 2 5 4-1 1-4-.5-5-4z" />
        <path d="M12 13.5c0 3-2 5-4 5-1-1 .5-4 4-5z" />
        <path d="M10.5 12c-3 0-5-2-5-4 1-1 4 .5 5 4z" />
      </svg>
    );

  // ── Utility ──────────────────────────────────────────────────────
  if (/air.condition|central.a\/c|hvac|cool/.test(n))
    return (
      <svg {...p}>
        <path d="M3 7.5h11a2.5 2.5 0 1 0-2.5-2.5" />
        <path d="M3 12h14a2.5 2.5 0 1 1-2.5 2.5" />
        <path d="M3 16.5h9a2.5 2.5 0 1 1-2.5 2.5" />
      </svg>
    );

  if (/washer|dryer|laundry|w\/d|hookup/.test(n))
    return (
      <svg {...p}>
        <rect x="3.5" y="4" width="17" height="16" rx="1.2" />
        <circle cx="12" cy="13" r="4.5" />
        <circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <line x1="6.5" y1="7" x2="8.5" y2="7" />
        <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );

  if (/smart/.test(n))
    return (
      <svg {...p}>
        <path d="M3.5 11.5l8.5-7.5 8.5 7.5v8.5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1z" />
        <circle cx="12" cy="14" r="2" />
        <line x1="12" y1="11" x2="12" y2="11.6" />
        <line x1="12" y1="16.4" x2="12" y2="17" />
        <line x1="9" y1="14" x2="9.6" y2="14" />
        <line x1="14.4" y1="14" x2="15" y2="14" />
        <line x1="10" y1="12" x2="10.4" y2="12.4" />
        <line x1="13.6" y1="15.6" x2="14" y2="16" />
        <line x1="14" y1="12" x2="13.6" y2="12.4" />
        <line x1="10.4" y1="15.6" x2="10" y2="16" />
      </svg>
    );

  // ── Building ─────────────────────────────────────────────────────
  if (/built|year/.test(n))
    return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
        <circle cx="8" cy="14" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="16" cy="14" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="8" cy="18" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="18" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );

  if (/stor(y|ies)|stair/.test(n))
    return (
      <svg {...p}>
        <path d="M4 20h4v-3h4v-3h4v-3h4" />
        <line x1="4" y1="20" x2="4" y2="22" />
        <line x1="20" y1="9" x2="20" y2="11" />
      </svg>
    );

  if (/siding|vinyl siding/.test(n))
    return (
      <svg {...p}>
        <rect x="3" y="6" width="18" height="14" rx="0.5" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="3" y1="14" x2="21" y2="14" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    );

  if (/roof|asphalt|shingle/.test(n))
    return (
      <svg {...p}>
        <path d="M2 14l10-9 10 9" />
        <path d="M6 11.4l6-5.4 6 5.4" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    );

  if (/electric|heat|heating|bolt|power/.test(n))
    return (
      <svg {...p} strokeWidth={1.5}>
        <polygon points="13,2 5,13 11,13 9,22 19,10 13,10 14,2" />
      </svg>
    );

  // ── Pet ──────────────────────────────────────────────────────────
  if (/pet|dog|cat/.test(n))
    return (
      <svg {...p}>
        <ellipse cx="5.5" cy="10" rx="1.7" ry="2.3" transform="rotate(-20 5.5 10)" />
        <ellipse cx="9.5" cy="6" rx="1.7" ry="2.3" transform="rotate(-8 9.5 6)" />
        <ellipse cx="14.5" cy="6" rx="1.7" ry="2.3" transform="rotate(8 14.5 6)" />
        <ellipse cx="18.5" cy="10" rx="1.7" ry="2.3" transform="rotate(20 18.5 10)" />
        <path d="M8 17.5c0-2.5 1.8-4 4-4s4 1.5 4 4-2 3.2-4 3.2-4-.7-4-3.2z" />
      </svg>
    );

  // ── Fallback ─────────────────────────────────────────────────────
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
