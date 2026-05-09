# Rently.com API Documentation

Discovered by reverse-engineering `https://homes.rently.com/homes-for-rent/`.

---

## Base URL

```
https://r4vyup271c.execute-api.us-east-1.amazonaws.com/prod
```

No API key required for public (unauthenticated) listing calls.

---

## Endpoints

### 1. Geocoder — resolve city name → bounding box

```
GET /api/geo_search?location=Atlanta
```

**Response:**
```json
{
  "success": true,
  "place_id": "ChIJjQmTaV0E9YgRC2MLmS_e_mY",
  "city": "Atlanta",
  "state": "Georgia",
  "state_short": "GA",
  "country": "United States",
  "geometry": {
    "bounds": {
      "northeast": { "lat": 33.886823, "lng": -84.2895601 },
      "southwest": { "lat": 33.647946, "lng": -84.550854 }
    },
    "location": { "lat": 33.7501275, "lng": -84.3885209 }
  }
}
```

---

### 2. Individual SFR Homes Search

```
GET /api/searchQueryNew
```

**Key Parameters:**

| Param | Value | Notes |
|-------|-------|-------|
| `rentalType` | `0` | 0=all, sfr focus |
| `pc` | `1` | page (not reliably paginated) |
| `smart_match` | `false` | |
| `from_web` | `true` | required |
| `city_filter` | `Atlanta` | city name |
| `latitude1` | `33.647946` | SW lat (bounding box) |
| `longitude1` | `-84.550854` | SW lng (bounding box) |
| `latitude2` | `33.886823` | NE lat (bounding box) |
| `longitude2` | `-84.2895601` | NE lng (bounding box) |
| `searchLatitude` | `33.7501275` | center lat |
| `searchLongitude` | `-84.3885209` | center lng |

**Response:**
```json
{
  "isAuthorizedCall": false,
  "property_data": [
    {
      "id": 6208589,
      "title": "2BD | 2BA | $2,545 /mo | Cats OK | Dogs OK | 1600 sq ft",
      "headline": "Beautifully Updated Grant Park Home...",
      "city": "Atlanta",
      "address": "225 Woodward Ave SE Atlanta, GA 30312",
      "latitude": 33.7454541,
      "longitude": -84.38025689999999,
      "type": "House",
      "property_type": "sfr",
      "floorplan": {
        "bedrooms": 2,
        "bathrooms": 2,
        "rent": 2545,
        "size": "1600",
        "cat": true,
        "dog": true,
        "no_pet": false
      },
      "picture": "https://d39tc8gklidfbm.cloudfront.net/images/63891860/medium",
      "picture_large": "https://d39tc8gklidfbm.cloudfront.net/images/63891860/large",
      "has_main_photo": true,
      "ready_date_text": "Now",
      "for_sale": false,
      "mode": "on"
    }
  ],
  "nearest_property_data": [ ... ]
}
```

- `property_data` — homes inside the bounding box
- `nearest_property_data` — homes just outside the box (useful for overlap)
- Returns up to ~200 results per bbox call
- Deduplicate by `id` when combining results from multiple boxes

---

### 3. Apartment Communities Search

```
GET /api/homes_listings
```

Same parameters as `searchQueryNew`, plus `community_type=all`.

**Response:**
```json
{
  "community_data": [
    {
      "id": 3006,
      "name": "Pine Harbour",
      "city": "Orlando",
      "state": "FL",
      "zipcode": "32825",
      "latitude": 28.5488597,
      "longitude": -81.2294493,
      "address": "Orlando",
      "gallery_photos": [
        {
          "order": 1,
          "large_url": "https://d39tc8gklidfbm.cloudfront.net/images/47112298/large",
          "medium_url": "https://d39tc8gklidfbm.cloudfront.net/images/47112298/medium"
        }
      ],
      "floorplan": {
        "min_bedrooms": 1, "max_bedrooms": 3,
        "min_bathrooms": 1, "max_bathrooms": 2,
        "min_rent": 900, "max_rent": 2200,
        "min_size": 500, "max_size": 1200
      },
      "active_units_count": 5,
      "property_type": "multi_family_communities"
    }
  ],
  "nearest_community_data": [ ... ]
}
```

Without bbox params, returns all 873 communities nationwide in one call.

---

### 4. Property Detail (Full)

```
GET /api/propertyDetails/{id}
```

**Response — `property` object:**

| Field | Notes |
|-------|-------|
| `id` | numeric ID |
| `title` | "2BD \| 2BA \| $2,545 /mo ..." |
| `headline` | marketing headline |
| `description` | full text description |
| `address` | sometimes empty — use list endpoint address |
| `street_address` | sometimes empty |
| `city`, `state`, `zipcode` | always present |
| `bedrooms`, `bathrooms` | numeric |
| `price` | monthly rent |
| `size` | sqft as string |
| `deposit` | security deposit amount |
| `allow_cat`, `allow_dog` | booleans |
| `pictures` | array of CDN image URLs (up to 20+) |
| `amenities` | JSON string of amenity objects |
| `latitude`, `longitude` | coordinates |
| `ready_date` | available date |
| `updated_at` | ISO timestamp |

**Note:** `address` field in the detail endpoint is often blank. Always use `address` from the `searchQueryNew` response.

---

## Scraping Strategy

All 50 US states are covered. Nationwide counts observed:
- **SFR homes**: unknown total (200 per bbox, need grid)
- **Communities**: 873 total (single call, no bbox needed)

**Recommended approach:**

1. Call `homes_listings` with no params → get all 873 communities at once
2. Get US metro bounding boxes via `geo_search` for ~100 major cities
3. Call `searchQueryNew` for each metro bbox → collect all `property_data` + `nearest_property_data`
4. Deduplicate by `id`
5. For each unique property ID, call `propertyDetails/{id}` → get full description + all photos

**State distribution of communities:**
NC:114, TX:104, FL:96, GA:89, CA:63, CO:50, SC:42, AZ:48, TN:30, VA:19, AL:21, MO:17, NE:17, OH:17, KS:15, WA:14, MD:13, IN:14, LA:10, OR:11, MA:6, CT:6, NM:6, MI:7, OK:5, NV:5, IL:4, AR:4, KY:9, DC:2, IA:2, NJ:2, ID:2, UT:2, MS:2, WV:1, NY:3, PA:1

---

## Image CDN

All images served from CloudFront:
```
https://d39tc8gklidfbm.cloudfront.net/images/{image_id}/large
https://d39tc8gklidfbm.cloudfront.net/images/{image_id}/medium
```

No auth required. Images are publicly accessible.
