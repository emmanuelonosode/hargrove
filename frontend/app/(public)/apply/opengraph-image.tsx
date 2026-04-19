import { ImageResponse } from 'next/og'
import { OGImage } from '@/lib/og-image'

export const runtime = 'edge'
export const alt = 'Apply to rent a home — Hasker & Co. Realty Group'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OGImage
        eyebrow="Apply"
        title={'Apply to Rent\na Home Online'}
        subtitle="Simple application, reviewed in 24 hours. Affordable homes across 12+ US cities."
      />
    ),
    { ...size },
  )
}
