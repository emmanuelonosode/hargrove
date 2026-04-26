import type { ReactElement } from 'react'

// ── Icon assets (URL-encoded SVGs for satori <img>) ──────────────────────────

// Small icon mark (circle bg + house) — 44×44 viewBox
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

// Large decorative mark (house only, no circle bg) — 320×320 viewBox
const DECO_SVG =
  '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20320%20320%22%3E' +
  '%3Cpolygon%20points%3D%2276%2C160%20160%2C56%20244%2C160%20160%2C264%22%20fill%3D%22none%22%20stroke%3D%22%231A56DB%22%20stroke-width%3D%228%22/%3E' +
  '%3Cpolygon%20points%3D%22120%2C160%20160%2C104%20200%2C160%22%20fill%3D%22none%22%20stroke%3D%22%231A56DB%22%20stroke-width%3D%225%22/%3E' +
  '%3Crect%20x%3D%22124%22%20y%3D%22160%22%20width%3D%2272%22%20height%3D%2250%22%20rx%3D%224%22%20fill%3D%22none%22%20stroke%3D%22%231A56DB%22%20stroke-width%3D%225%22/%3E' +
  '%3Crect%20x%3D%22146%22%20y%3D%22170%22%20width%3D%2228%22%20height%3D%2240%22%20rx%3D%224%22%20fill%3D%22none%22%20stroke%3D%22%231A56DB%22%20stroke-width%3D%225%22/%3E' +
  '%3C/svg%3E'

const ICON_SRC = `data:image/svg+xml,${ICON_SVG}`
const DECO_SRC = `data:image/svg+xml,${DECO_SVG}`

export type OGImageProps = {
  title: string
  subtitle: string
  eyebrow?: string
  /** Override the right-side tag chips */
  tags?: string[]
}

/**
 * Shared OG image layout (1200×630) rendered by next/og Satori.
 * Layout: brand lockup + eyebrow + headline left | large decorative
 * house mark right. Premium dark-navy aesthetic.
 */
export function OGImage({ title, subtitle, eyebrow, tags }: OGImageProps): ReactElement {
  const titleLines = title.split('\n')
  const displayTags = tags ?? ['Affordable Rents', 'For Sale Homes', '12+ US Cities']

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: '#0B1F3A',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Blue left accent rail ──────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: '6px',
          background: '#1A56DB',
          display: 'flex',
        }}
      />

      {/* ── Right decorative panel ─────────────────────────────── */}
      {/* Outer glow circle */}
      <div
        style={{
          position: 'absolute',
          right: '-60px',
          top: '50%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.18) 0%, rgba(26,86,219,0.04) 55%, transparent 75%)',
          display: 'flex',
          marginTop: '-280px',
        }}
      />
      {/* Blueprint-style outline house mark (large) */}
      <div
        style={{
          position: 'absolute',
          right: '52px',
          top: '95px',
          opacity: 0.22,
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DECO_SRC} width={340} height={340} alt="" />
      </div>
      {/* Filled icon mark centered in the glow (smaller, more opaque) */}
      <div
        style={{
          position: 'absolute',
          right: '150px',
          top: '178px',
          opacity: 0.6,
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ICON_SRC} width={152} height={152} alt="" />
      </div>

      {/* ── Left content column ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 0 0 72px',
          width: '730px',
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '44px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON_SRC} width={52} height={52} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }}>
            <div style={{
              color: '#FFFFFF',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              lineHeight: 1,
              display: 'flex',
            }}>
              HASKER &amp; CO.
            </div>
            <div style={{
              color: '#1A56DB',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '3.5px',
              marginTop: '5px',
              display: 'flex',
            }}>
              REALTY GROUP
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '56px',
          height: '3px',
          background: '#1A56DB',
          borderRadius: '2px',
          marginBottom: '28px',
          display: 'flex',
        }} />

        {/* Eyebrow */}
        {eyebrow ? (
          <div style={{
            display: 'flex',
            color: '#60A5FA',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            {eyebrow}
          </div>
        ) : null}

        {/* Headline */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF',
          fontSize: '62px',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-1.5px',
        }}>
          {titleLines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>{line}</div>
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          display: 'flex',
          color: '#93C5FD',
          fontSize: '21px',
          lineHeight: 1.45,
          marginTop: '24px',
          maxWidth: '600px',
          fontWeight: 400,
        }}>
          {subtitle}
        </div>
      </div>

      {/* ── Bottom strip ──────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '76px',
          background: 'rgba(9,22,46,0.95)',
          borderTop: '1px solid rgba(26,86,219,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 72px 0 78px',
        }}
      >
        {/* Website */}
        <div style={{
          display: 'flex',
          color: '#1A56DB',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.3px',
        }}>
          haskerrealtygroup.com
        </div>

        {/* Tag chips */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {displayTags.map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                background: 'rgba(26,86,219,0.15)',
                border: '1px solid rgba(26,86,219,0.3)',
                borderRadius: '999px',
                padding: '6px 16px',
                color: '#93C5FD',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.2px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
