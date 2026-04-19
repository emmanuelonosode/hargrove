import { ImageResponse } from 'next/og'
import { OGImage } from '@/lib/og-image'

export const runtime = 'edge'
export const alt = "Free renter's guide and housing tips — Hasker & Co. Realty Group"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OGImage
        eyebrow="Blog"
        title={"Free Renter's\nGuide & Housing Tips"}
        subtitle="Practical guides for first-time renters, budgeting advice, lease tips, and local market updates."
      />
    ),
    { ...size },
  )
}
