import { ImageResponse } from 'next/og'
import { OGImage } from '@/lib/og-image'

export const runtime = 'edge'
export const alt = 'Browse affordable homes and rentals — Hasker & Co. Realty Group'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OGImage
        eyebrow="Properties"
        title={'Browse Affordable\nHomes & Rentals'}
        subtitle="Apartments and houses for rent & sale in Atlanta, Charlotte, Houston, Dallas, Nashville, Phoenix and more."
      />
    ),
    { ...size },
  )
}
