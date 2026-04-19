import { ImageResponse } from 'next/og'
import { OGImage } from '@/lib/og-image'

export const runtime = 'edge'
export const alt = 'Talk to a housing specialist today — Hasker & Co. Realty Group'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OGImage
        eyebrow="Contact"
        title={'Talk to a Housing\nSpecialist Today'}
        subtitle="Our team responds within 24 hours with matching properties. No fees, no pressure."
      />
    ),
    { ...size },
  )
}
