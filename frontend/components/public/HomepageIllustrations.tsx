// Editorial line art illustrations — Workers scene + Pet scene.
// Brand-aligned: navy stroke, brand-blue uniforms, warm + sage accents.

const HC = {
  brand:      '#1A56DB',
  brandDark:  '#0B1F3A',
  brandLight: '#EFF4FF',
  brandMuted: '#DBEAFE',
  terracotta: '#C97757',
  amber:      '#E8A33C',
  amberLt:    '#F4C77A',
  cream:      '#F7F1E6',
  sage:       '#7BA882',
  paper:      '#FBF9F4',
};

const SKINTONE = { warm: '#E0B597', med: '#C9926E' };
const STROKE = HC.brandDark;
const SW = 2.5;

type Holding = 'wrench' | 'toolbox' | 'paint';

interface WorkerProps {
  x: number; y: number; scale?: number;
  skin?: string; cap?: string; suit?: string; accent?: string;
  holding?: Holding; mirror?: boolean;
}

function Worker({ x, y, scale = 1, skin = SKINTONE.warm, cap = HC.brand, suit = HC.brand, accent = HC.amber, holding = 'wrench', mirror = false }: WorkerProps) {
  const sx = mirror ? -scale : scale;
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${scale})`}>
      <ellipse cx="-14" cy="0" rx="10" ry="4" fill={HC.brandDark} />
      <ellipse cx="-14" cy="0" rx="10" ry="4" />
      <ellipse cx="14" cy="0" rx="10" ry="4" fill={HC.brandDark} />
      <ellipse cx="14" cy="0" rx="10" ry="4" />

      <path d="M -20 -2 Q -22 -55 -10 -60 L -2 -60 L -2 -2 Z" fill={suit} />
      <path d="M -20 -2 Q -22 -55 -10 -60 L -2 -60 L -2 -2 Z" />
      <path d="M 20 -2 Q 22 -55 10 -60 L 2 -60 L 2 -2 Z" fill={suit} />
      <path d="M 20 -2 Q 22 -55 10 -60 L 2 -60 L 2 -2 Z" />

      <path d="M -28 -60 Q -32 -120 -18 -140 L 18 -140 Q 32 -120 28 -60 Z" fill={suit} />
      <path d="M -28 -60 Q -32 -120 -18 -140 L 18 -140 Q 32 -120 28 -60 Z" />

      <rect x="-30" y="-66" width="60" height="8" fill={HC.brandDark} />
      <rect x="-30" y="-66" width="60" height="8" />
      <rect x="-12" y="-66" width="6" height="14" fill={accent} />
      <rect x="-12" y="-66" width="6" height="14" />
      <circle cx="14" cy="-62" r="3.5" fill={accent} />
      <circle cx="14" cy="-62" r="3.5" />

      <rect x="-6" y="-148" width="12" height="10" fill={skin} />
      <rect x="-6" y="-148" width="12" height="10" />
      <circle cx="0" cy="-162" r="16" fill={skin} />
      <circle cx="0" cy="-162" r="16" />

      <path d="M -16 -162 Q -16 -184 0 -184 Q 16 -184 16 -162 Z" fill={cap} />
      <path d="M -16 -162 Q -16 -184 0 -184 Q 16 -184 16 -162 Z" />
      <path d="M -16 -162 L 22 -162 L 22 -158 L 16 -158 Z" fill={cap} />
      <path d="M -16 -162 L 22 -162 L 22 -158 L 16 -158 Z" />
      <circle cx="0" cy="-172" r="3" fill={HC.amberLt} />
      <circle cx="0" cy="-172" r="3" />

      {holding === 'wrench' && (
        <g>
          <path d="M 24 -110 Q 56 -100 60 -70 L 50 -68 Q 46 -94 18 -100 Z" fill={suit} />
          <path d="M 24 -110 Q 56 -100 60 -70 L 50 -68 Q 46 -94 18 -100 Z" />
          <circle cx="58" cy="-66" r="6" fill={skin} />
          <circle cx="58" cy="-66" r="6" />
          <g transform="translate(58,-66) rotate(40)">
            <rect x="-4" y="-50" width="8" height="50" fill={HC.brand} />
            <rect x="-4" y="-50" width="8" height="50" />
            <path d="M -8 -50 L 8 -50 L 10 -64 L 4 -70 L 2 -60 L -2 -60 L -4 -70 L -10 -64 Z" fill={HC.brand} />
            <path d="M -8 -50 L 8 -50 L 10 -64 L 4 -70 L 2 -60 L -2 -60 L -4 -70 L -10 -64 Z" />
          </g>
        </g>
      )}
      {holding === 'toolbox' && (
        <g>
          <path d="M 24 -110 Q 56 -100 58 -78 L 48 -76 Q 46 -94 18 -100 Z" fill={suit} />
          <path d="M 24 -110 Q 56 -100 58 -78 L 48 -76 Q 46 -94 18 -100 Z" />
          <circle cx="56" cy="-72" r="6" fill={skin} />
          <circle cx="56" cy="-72" r="6" />
          <g transform="translate(56,-50)">
            <rect x="-28" y="-12" width="56" height="22" fill={HC.terracotta} />
            <rect x="-28" y="-12" width="56" height="22" />
            <path d="M -14 -12 Q -14 -22 0 -22 Q 14 -22 14 -12" />
            <line x1="-28" y1="-6" x2="28" y2="-6" />
          </g>
        </g>
      )}
      {holding === 'paint' && (
        <g>
          <path d="M 24 -110 Q 56 -100 58 -78 L 48 -76 Q 46 -94 18 -100 Z" fill={suit} />
          <path d="M 24 -110 Q 56 -100 58 -78 L 48 -76 Q 46 -94 18 -100 Z" />
          <circle cx="56" cy="-72" r="6" fill={skin} />
          <circle cx="56" cy="-72" r="6" />
          <g transform="translate(56,-50)">
            <rect x="-3" y="-22" width="6" height="22" fill={HC.brand} />
            <rect x="-3" y="-22" width="6" height="22" />
            <rect x="-14" y="-32" width="28" height="10" fill={HC.amber} />
            <rect x="-14" y="-32" width="28" height="10" />
          </g>
        </g>
      )}

      <path d="M -24 -110 Q -36 -92 -34 -68 L -24 -66 Q -22 -90 -18 -100 Z" fill={suit} />
      <path d="M -24 -110 Q -36 -92 -34 -68 L -24 -66 Q -22 -90 -18 -100 Z" />
      <circle cx="-30" cy="-64" r="6" fill={skin} />
      <circle cx="-30" cy="-64" r="6" />
    </g>
  );
}

export function WorkersScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      fill="none"
      stroke={STROKE}
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <rect width="800" height="500" fill={HC.paper} stroke="none" />
      <circle cx="620" cy="120" r="120" fill={HC.amberLt} stroke="none" opacity="0.5" />

      {/* House */}
      <g opacity="0.95">
        <path d="M 130 220 L 400 60 L 670 220 Z" fill={HC.brand} />
        <path d="M 130 220 L 400 60 L 670 220 Z" />
        <rect x="170" y="220" width="460" height="220" fill={HC.cream} />
        <rect x="170" y="220" width="460" height="220" />
        <rect x="520" y="100" width="36" height="80" fill={HC.cream} />
        <rect x="520" y="100" width="36" height="80" />
        <rect x="210" y="260" width="80" height="80" fill={HC.amberLt} />
        <rect x="210" y="260" width="80" height="80" />
        <line x1="250" y1="260" x2="250" y2="340" />
        <line x1="210" y1="300" x2="290" y2="300" />
        <rect x="510" y="260" width="80" height="80" fill={HC.amberLt} />
        <rect x="510" y="260" width="80" height="80" />
        <line x1="550" y1="260" x2="550" y2="340" />
        <line x1="510" y1="300" x2="590" y2="300" />
        <path d="M 360 440 L 360 380 Q 360 350 400 350 Q 440 350 440 380 L 440 440 Z" fill={HC.terracotta} />
        <path d="M 360 440 L 360 380 Q 360 350 400 350 Q 440 350 440 380 L 440 440" />
      </g>

      <line x1="0" y1="440" x2="800" y2="440" />

      {/* Ladder */}
      <g>
        <line x1="90" y1="440" x2="180" y2="200" />
        <line x1="120" y1="440" x2="210" y2="200" />
        {[0,1,2,3,4,5,6].map((i) => {
          const t = i / 7;
          const x1 = 90 + (180 - 90) * t, y1 = 440 - 240 * t;
          const x2 = 120 + (210 - 120) * t, y2 = 440 - 240 * t;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      <Worker x={210} y={440} scale={1.05} skin={SKINTONE.med} suit={HC.brand} cap={HC.brandDark} holding="toolbox" />
      <Worker x={640} y={440} scale={1.05} skin={SKINTONE.warm} suit={HC.brandDark} cap={HC.brand} holding="wrench" mirror />

      {/* Quality stamp */}
      <g transform="translate(400, 320)">
        <circle r="20" fill={HC.amber} />
        <circle r="20" />
        <path d="M -8 0 L -3 6 L 9 -7" strokeWidth="3.2" stroke={HC.brandDark} fill="none" />
      </g>

      {/* Flourishes */}
      <g>
        <line x1="700" y1="290" x2="715" y2="278" />
        <line x1="720" y1="300" x2="735" y2="290" />
        <circle cx="725" cy="320" r="2" fill={HC.brandDark} stroke="none" />
        <ellipse cx="60" cy="430" rx="8" ry="14" fill={HC.sage} transform="rotate(-25 60 430)" />
        <ellipse cx="60" cy="430" rx="8" ry="14" transform="rotate(-25 60 430)" />
        <ellipse cx="760" cy="430" rx="8" ry="14" fill={HC.sage} transform="rotate(25 760 430)" />
        <ellipse cx="760" cy="430" rx="8" ry="14" transform="rotate(25 760 430)" />
        <path d="M 480 80 q 8 -8 16 0 q 8 -8 16 0" />
      </g>
    </svg>
  );
}

export function PetScene() {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      stroke={STROKE}
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <rect width="600" height="500" fill={HC.paper} stroke="none" />
      <circle cx="300" cy="250" r="200" fill={HC.amberLt} stroke="none" opacity="0.5" />

      {/* Door frame */}
      <path d="M 160 460 L 160 200 Q 160 130 220 130 L 380 130 Q 440 130 440 200 L 440 460 Z" fill={HC.brandLight} />
      <path d="M 160 460 L 160 200 Q 160 130 220 130 L 380 130 Q 440 130 440 200 L 440 460" />
      <path d="M 180 460 L 180 210 Q 180 150 230 150 L 370 150 Q 420 150 420 210 L 420 460 Z" fill={HC.brand} />
      <path d="M 180 460 L 180 210 Q 180 150 230 150 L 370 150 Q 420 150 420 210 L 420 460" />
      <circle cx="395" cy="320" r="6" fill={HC.amber} />
      <circle cx="395" cy="320" r="6" />

      {/* House number */}
      <circle cx="135" cy="170" r="20" fill={HC.paper} />
      <circle cx="135" cy="170" r="20" />
      <text x="135" y="178" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="18" fontWeight="700" fill={HC.brandDark} stroke="none">12</text>

      {/* Ground + mat */}
      <line x1="40" y1="460" x2="560" y2="460" />
      <rect x="220" y="460" width="160" height="22" fill={HC.terracotta} />
      <rect x="220" y="460" width="160" height="22" />
      {[0,1,2,3,4,5].map((i) => (
        <line key={i} x1={236 + i*24} y1="460" x2={236 + i*24} y2="482" />
      ))}

      {/* Dog */}
      <g transform="translate(120, 460)">
        <path d="M 30 -12 Q 50 -30 60 -10" fill={HC.amber} />
        <path d="M 30 -12 Q 50 -30 60 -10" />
        <path d="M -28 0 Q -32 -60 -10 -88 Q 10 -100 30 -90 Q 50 -78 46 -50 Q 50 -28 38 0 Z" fill={HC.amber} />
        <path d="M -28 0 Q -32 -60 -10 -88 Q 10 -100 30 -90 Q 50 -78 46 -50 Q 50 -28 38 0 Z" />
        <path d="M -12 -2 Q -8 -32 10 -50" stroke={HC.brandDark} opacity="0.25" fill="none" />
        <circle cx="0" cy="-100" r="26" fill={HC.amber} />
        <circle cx="0" cy="-100" r="26" />
        <ellipse cx="6" cy="-94" rx="14" ry="10" fill={HC.cream} />
        <ellipse cx="6" cy="-94" rx="14" ry="10" />
        <ellipse cx="14" cy="-96" rx="4" ry="3" fill={HC.brandDark} stroke="none" />
        <circle cx="-4" cy="-104" r="2" fill={HC.brandDark} stroke="none" />
        <path d="M -18 -116 Q -28 -100 -22 -82" fill={HC.amber} />
        <path d="M -18 -116 Q -28 -100 -22 -82" />
        <path d="M 16 -116 Q 28 -100 22 -82" fill={HC.amber} />
        <path d="M 16 -116 Q 28 -100 22 -82" />
        <path d="M -18 -76 Q 0 -68 18 -76" stroke={HC.brand} strokeWidth="3" fill="none" />
        <circle cx="0" cy="-69" r="3" fill={HC.brand} />
        <circle cx="0" cy="-69" r="3" />
      </g>

      {/* Cat */}
      <g transform="translate(480, 460)">
        <path d="M -32 -8 Q -60 -22 -40 -50" fill={HC.brandDark} opacity="0.85" />
        <path d="M -32 -8 Q -60 -22 -40 -50" />
        <path d="M -24 0 Q -28 -50 -8 -68 Q 10 -76 24 -68 Q 36 -50 32 0 Z" fill={HC.brandDark} />
        <path d="M -24 0 Q -28 -50 -8 -68 Q 10 -76 24 -68 Q 36 -50 32 0 Z" />
        <path d="M -4 -4 Q 0 -40 6 -60 Q 14 -40 12 -4 Z" fill={HC.cream} opacity="0.95" />
        <path d="M -22 -86 Q -16 -98 -8 -100 L 8 -100 Q 16 -98 22 -86 Q 22 -68 0 -64 Q -22 -68 -22 -86 Z" fill={HC.brandDark} />
        <path d="M -22 -86 Q -16 -98 -8 -100 L 8 -100 Q 16 -98 22 -86 Q 22 -68 0 -64 Q -22 -68 -22 -86 Z" />
        <polygon points="-22,-90 -12,-104 -8,-92" fill={HC.brandDark} />
        <polygon points="-22,-90 -12,-104 -8,-92" />
        <polygon points="22,-90 12,-104 8,-92" fill={HC.brandDark} />
        <polygon points="22,-90 12,-104 8,-92" />
        <circle cx="-7" cy="-84" r="2.5" fill="#7BA882" stroke="none" />
        <circle cx="7" cy="-84" r="2.5" fill="#7BA882" stroke="none" />
        <path d="M -2 -76 L 2 -76 L 0 -73 Z" fill={HC.cream} stroke="none" />
        <line x1="-10" y1="-76" x2="-22" y2="-78" strokeWidth="1" />
        <line x1="-10" y1="-74" x2="-22" y2="-72" strokeWidth="1" />
        <line x1="10" y1="-76" x2="22" y2="-78" strokeWidth="1" />
        <line x1="10" y1="-74" x2="22" y2="-72" strokeWidth="1" />
        <path d="M -14 -68 Q 0 -60 14 -68" stroke={HC.brand} strokeWidth="3" fill="none" />
      </g>

      {/* Paw prints */}
      <g opacity="0.5">
        {([[260, 480], [310, 482], [340, 478]] as [number, number][]).map(([px, py], i) => (
          <g key={i} transform={`translate(${px},${py})`}>
            <ellipse cx="0" cy="0" rx="3" ry="4" fill={HC.brandDark} stroke="none" />
            <circle cx="-4" cy="-4" r="1.4" fill={HC.brandDark} stroke="none" />
            <circle cx="4" cy="-4" r="1.4" fill={HC.brandDark} stroke="none" />
            <circle cx="-6" cy="0" r="1.2" fill={HC.brandDark} stroke="none" />
            <circle cx="6" cy="0" r="1.2" fill={HC.brandDark} stroke="none" />
          </g>
        ))}
      </g>

      {/* Flourishes */}
      <g>
        <ellipse cx="60" cy="380" rx="6" ry="12" fill={HC.sage} transform="rotate(-25 60 380)" />
        <ellipse cx="60" cy="380" rx="6" ry="12" transform="rotate(-25 60 380)" />
        <ellipse cx="540" cy="380" rx="6" ry="12" fill={HC.sage} transform="rotate(25 540 380)" />
        <ellipse cx="540" cy="380" rx="6" ry="12" transform="rotate(25 540 380)" />
        <path d="M 80 220 q -8 -8 0 -16 q 8 8 0 16 Z" fill={HC.terracotta} stroke="none" />
        <path d="M 520 240 q -6 -6 0 -12 q 6 6 0 12 Z" fill={HC.brand} stroke="none" />
      </g>
    </svg>
  );
}
