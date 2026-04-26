import { ImageResponse } from "next/og";
import { fetchPropertyBySlug } from "@/lib/properties";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";

// URL-encoded icon mark — diamond house shape (matches logo.svg geometry)
const ICON_SVG =
  '%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2044%2044%22%3E' +
  '%3Ccircle%20cx%3D%2222%22%20cy%3D%2222%22%20r%3D%2222%22%20fill%3D%22rgba(11%2C31%2C58%2C0.7)%22/%3E' +
  '%3Cg%20transform%3D%22translate(22%2C22)%20scale(0.173)%20translate(-160%2C-160)%22%3E' +
  '%3Cpolygon%20points%3D%2276%2C160%20160%2C56%20244%2C160%20160%2C264%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3Cpolygon%20points%3D%22120%2C160%20160%2C104%20200%2C160%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%22124%22%20y%3D%22160%22%20width%3D%2272%22%20height%3D%2250%22%20rx%3D%224%22%20fill%3D%22%23FFFFFF%22/%3E' +
  '%3Crect%20x%3D%22146%22%20y%3D%22170%22%20width%3D%2228%22%20height%3D%2240%22%20rx%3D%224%22%20fill%3D%22%231A56DB%22/%3E' +
  '%3C/g%3E' +
  '%3C/svg%3E';
const ICON_SRC = `data:image/svg+xml,${ICON_SVG}`;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  let title = "Property Listing";
  let price = "";
  let beds = "";
  let baths = "";
  let city = "";
  let photoUrl = FALLBACK;

  try {
    const { slug } = await params;
    const property = await fetchPropertyBySlug(slug);

    title = property.title;
    price = property.price_label || `$${property.price.toLocaleString()}`;
    beds = `${property.bedrooms} bd`;
    baths = `${property.bathrooms} ba`;
    city = [property.city, property.state].filter(Boolean).join(", ");

    const primaryImg =
      property.images?.find((img) => img.is_primary)?.image_url ??
      property.images?.[0]?.image_url ??
      property.primary_image_url;

    if (primaryImg) photoUrl = primaryImg;
  } catch {
    // fallback values already set
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          fontFamily: "serif",
          overflow: "hidden",
        }}
      >
        {/* Full-bleed property photo */}
        <img
          src={photoUrl}
          width={1200}
          height={630}
          style={{ objectFit: "cover", position: "absolute", inset: 0 }}
        />

        {/* Gradient overlay — dark at bottom for text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(11,31,58,0.15) 0%, rgba(11,31,58,0.3) 40%, rgba(11,31,58,0.88) 75%, rgba(11,31,58,0.96) 100%)",
            display: "flex",
          }}
        />

        {/* Logo badge — top left */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(11,31,58,0.82)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 6,
            padding: "10px 20px 10px 12px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON_SRC} width={36} height={36} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, letterSpacing: 0.3, lineHeight: 1 }}>
              HASKER &amp; CO.
            </span>
            <span style={{ color: "#1A56DB", fontSize: 9, fontWeight: 500, letterSpacing: 3, lineHeight: 1 }}>
              REALTY GROUP
            </span>
          </div>
        </div>

        {/* Bottom content block */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 48px 44px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Price */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                color: "#60A5FA",
                fontSize: 36,
                fontWeight: 700,
                fontFamily: "serif",
                letterSpacing: -0.5,
              }}
            >
              {price}
            </span>
            {city && (
              <span
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 18,
                  marginTop: 4,
                  fontFamily: "sans-serif",
                }}
              >
                · {city}
              </span>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 700,
              fontFamily: "serif",
              lineHeight: 1.15,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Chips row */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {[beds, baths, "For Rent"].map((chip) => (
              <div
                key={chip}
                style={{
                  background: "rgba(26,86,219,0.85)",
                  border: "1px solid rgba(96,165,250,0.4)",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "6px 18px",
                  borderRadius: 4,
                  display: "flex",
                  fontFamily: "sans-serif",
                  letterSpacing: 0.3,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
