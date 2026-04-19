import type { ReactElement } from 'react'

// Diamond house mark, URL-encoded SVG data URI. Satori renders <img> from this.
const MARK_SVG =
  '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%3E' +
  '%3Cpolygon%20points%3D%224.8%2C16%2016%2C2%2027.2%2C16%2016%2C30%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3Cpolygon%20points%3D%2210.4%2C16%2016%2C8.3%2021.6%2C16%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%2211.1%22%20y%3D%2216%22%20width%3D%229.8%22%20height%3D%227%22%20rx%3D%220.7%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%2213.9%22%20y%3D%2217.4%22%20width%3D%224.2%22%20height%3D%225.6%22%20rx%3D%220.7%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3C/svg%3E'

const MARK_SRC = `data:image/svg+xml,${MARK_SVG}`

export type OGImageProps = {
  title: string
  subtitle: string
  eyebrow?: string
}

/**
 * Shared OG image layout (1200x630) rendered by `next/og` Satori.
 * Returns a plain JSX tree — no React Server Component features, no grid,
 * no clip-path, no gap on absolutely positioned children.
 */
export function OGImage({ title, subtitle, eyebrow }: OGImageProps): ReactElement {
  // Split the title on explicit newlines so Satori lays out two lines reliably.
  const titleLines = title.split('\n')

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: '#0B1F3A',
        fontFamily:
          '"Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '10px',
          background: '#1A56DB',
          display: 'flex',
        }}
      />

      {/* Right-side decorative zone (~35% of width = ~420px) */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '420px',
          height: '630px',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Faint large diamond silhouette centered in the zone */}
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '135px',
            width: '340px',
            height: '340px',
            background: 'rgba(26,86,219,0.08)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
        {/* Thin diagonal stripes */}
        <div
          style={{
            position: 'absolute',
            left: '-80px',
            top: '120px',
            width: '700px',
            height: '3px',
            background: 'rgba(26,86,219,0.15)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-40px',
            top: '240px',
            width: '700px',
            height: '3px',
            background: 'rgba(26,86,219,0.15)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '0px',
            top: '360px',
            width: '700px',
            height: '3px',
            background: 'rgba(26,86,219,0.15)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '480px',
            width: '700px',
            height: '3px',
            background: 'rgba(26,86,219,0.15)',
            transform: 'rotate(45deg)',
            display: 'flex',
          }}
        />
      </div>

      {/* Top-left brand lockup */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '56px 0 0 72px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_SRC} width={40} height={40} alt="" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '14px',
          }}
        >
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            HASKER &amp; CO.
          </div>
          <div
            style={{
              color: '#1A56DB',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '3px',
              marginTop: '4px',
              display: 'flex',
            }}
          >
            REALTY GROUP
          </div>
        </div>
      </div>

      {/* Center-left body: eyebrow, headline, subtitle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 420px 0 72px',
          marginTop: '80px',
        }}
      >
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              color: '#93C5FD',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#FFFFFF',
            fontSize: '56px',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          {titleLines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            color: '#93C5FD',
            fontSize: '22px',
            lineHeight: 1.45,
            marginTop: '28px',
            maxWidth: '660px',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '72px',
          background: '#0D2550',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 72px 0 82px',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#1A56DB',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          haskerrealtygroup.com
        </div>
        <div
          style={{
            display: 'flex',
            color: '#93C5FD',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          Affordable Homes · Honest Prices · 12+ Cities
        </div>
      </div>
    </div>
  )
}
