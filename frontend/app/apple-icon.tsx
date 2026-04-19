import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Diamond house mark (same geometry as app/icon.svg, 32x32 viewBox).
// URL-encoded for use as an <img src> data URI inside Satori.
const MARK_SVG =
  '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%3E' +
  '%3Cpolygon%20points%3D%224.8%2C16%2016%2C2%2027.2%2C16%2016%2C30%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3Cpolygon%20points%3D%2210.4%2C16%2016%2C8.3%2021.6%2C16%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%2211.1%22%20y%3D%2216%22%20width%3D%229.8%22%20height%3D%227%22%20rx%3D%220.7%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%2213.9%22%20y%3D%2217.4%22%20width%3D%224.2%22%20height%3D%225.6%22%20rx%3D%220.7%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3C/svg%3E'

const MARK_SRC = `data:image/svg+xml,${MARK_SVG}`

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B1F3A',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_SRC} width={132} height={132} alt="" />
      </div>
    ),
    { ...size },
  )
}
