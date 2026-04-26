import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hasker & Co. Realty Group — Quality Homes. No Hidden Fees.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Trustpilot-green star box
function Star() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        background: '#00B67A',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
  )
}

// URL-encoded inline SVG for the brand icon mark (Satori requires img tags for SVGs)
const ICON_SVG =
  '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2044%2044%22%3E' +
  '%3Ccircle%20cx%3D%2222%22%20cy%3D%2222%22%20r%3D%2222%22%20fill%3D%22%230B1F3A%22/%3E' +
  '%3Cg%20transform%3D%22translate(22%2C22)%20scale(0.173)%20translate(-160%2C-160)%22%3E' +
  '%3Cpolygon%20points%3D%2276%2C160%20160%2C56%20244%2C160%20160%2C264%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3Cpolygon%20points%3D%22120%2C160%20160%2C104%20200%2C160%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%22124%22%20y%3D%22160%22%20width%3D%2272%22%20height%3D%2250%22%20rx%3D%224%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%22146%22%20y%3D%22170%22%20width%3D%2228%22%20height%3D%2240%22%20rx%3D%224%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3C/g%3E' +
  '%3C/svg%3E'

const ICON_SRC = `data:image/svg+xml,${ICON_SVG}`

// Warm modern house photo — used as right-panel backdrop
const PHOTO_URL =
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=960&q=85&auto=format&fit=crop'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#0B1F3A',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Right photo panel ──────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 520,
            display: 'flex',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_URL}
            width={520}
            height={630}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            alt=""
          />
          {/* Left-to-right fade from navy into the photo */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, #0B1F3A 0%, rgba(11,31,58,0.72) 35%, rgba(11,31,58,0.18) 70%, rgba(11,31,58,0.08) 100%)',
              display: 'flex',
            }}
          />
          {/* Subtle vignette at top + bottom edges */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(11,31,58,0.45) 0%, transparent 25%, transparent 75%, rgba(11,31,58,0.55) 100%)',
              display: 'flex',
            }}
          />
        </div>

        {/* ── Blue left accent rail ──────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: 'linear-gradient(to bottom, #1A56DB, #3B82F6)',
            display: 'flex',
          }}
        />

        {/* ── Soft blue glow behind headline ────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            left: -80,
            top: 160,
            width: 600,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(26,86,219,0.12) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* ── Left content column ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 0 48px 72px',
            width: 700,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Brand lockup */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON_SRC} width={52} height={52} alt="" />
            <div
              style={{ display: 'flex', flexDirection: 'column', marginLeft: 16 }}
            >
              <div
                style={{
                  color: '#FFFFFF',
                  fontSize: 21,
                  fontWeight: 800,
                  letterSpacing: '-0.2px',
                  lineHeight: 1,
                  display: 'flex',
                }}
              >
                HASKER &amp; CO.
              </div>
              <div
                style={{
                  color: '#1A56DB',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '3.5px',
                  marginTop: 6,
                  display: 'flex',
                }}
              >
                REALTY GROUP
              </div>
            </div>
          </div>

          {/* Blue divider */}
          <div
            style={{
              width: 48,
              height: 3,
              background: '#1A56DB',
              borderRadius: 2,
              marginBottom: 24,
              display: 'flex',
            }}
          />

          {/* Eyebrow label */}
          <div
            style={{
              display: 'flex',
              color: '#60A5FA',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            Affordable Homes · 12+ US Cities
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: '#FFFFFF',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex' }}>Quality Homes.</div>
            <div style={{ display: 'flex', color: '#93C5FD' }}>No Hidden Fees.</div>
          </div>

          {/* Subheading */}
          <div
            style={{
              display: 'flex',
              color: 'rgba(255,255,255,0.62)',
              fontSize: 20,
              lineHeight: 1.5,
              fontWeight: 400,
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            Rent or buy in Atlanta, Charlotte, Houston, Dallas &amp; more.
            Fast approvals, honest prices.
          </div>

          {/* Trustpilot badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 10,
              padding: '13px 22px',
              width: 'fit-content',
              marginBottom: 'auto',
            }}
          >
            {/* Five green stars */}
            <div style={{ display: 'flex', gap: 4 }}>
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </div>

            {/* Score + label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  4.9
                </span>
                <span
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: 13,
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  / 5
                </span>
                <span
                  style={{
                    color: '#00B67A',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    lineHeight: 1,
                  }}
                >
                  Trustpilot
                </span>
              </div>
              <span
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 12,
                  letterSpacing: 0.2,
                  lineHeight: 1,
                  display: 'flex',
                }}
              >
                Based on 2,000+ verified reviews
              </span>
            </div>
          </div>

          {/* Bottom URL strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 28,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#1A56DB',
                display: 'flex',
              }}
            />
            <span
              style={{
                color: '#1A56DB',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              haskerrealtygroup.com
            </span>
          </div>
        </div>

        {/* ── Bottom-right overlay: key stats floating on the photo ─── */}
        <div
          style={{
            position: 'absolute',
            right: 36,
            bottom: 40,
            display: 'flex',
            gap: 10,
          }}
        >
          {[
            { value: '2,000+', label: 'Families Housed' },
            { value: '12+', label: 'Cities' },
            { value: '24hr', label: 'Approvals' },
          ].map((stat) => (
            <div
              key={stat.value}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(11,31,58,0.82)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 8,
                padding: '10px 18px',
                minWidth: 100,
              }}
            >
              <span
                style={{
                  color: '#60A5FA',
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.5px',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  letterSpacing: '0.8px',
                  marginTop: 4,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  display: 'flex',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
