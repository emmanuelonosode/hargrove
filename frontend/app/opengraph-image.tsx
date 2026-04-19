import { ImageResponse } from 'next/og'
import { OGImage } from '@/lib/og-image'

export const runtime = 'edge'
export const alt = 'Hasker & Co. Realty Group — Comfortable Living, Within Your Budget.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OGImage
        eyebrow="Hasker & Co. Realty Group"
        title={'Comfortable Living,\nWithin Your Budget.'}
        subtitle="Affordable homes to rent & buy across 12+ US cities. Honest prices, no hidden fees."
      />
    ),
    { ...size },
  )
}
