# Hasker & Co. — Property Data Schema Reference

> **Purpose:** Use this document when preparing bulk property listings for import into the Hasker & Co. platform. Follow the field definitions, accepted values, and order of operations exactly.

---

## Table of Contents

1. [Property (Core Record)](#1-property-core-record)
2. [Property Images](#2-property-images)
3. [Amenity Categories](#3-amenity-categories)
4. [Property Amenities](#4-property-amenities)
5. [Enum Reference (All Accepted Values)](#5-enum-reference)
6. [Order of Operations for Bulk Import](#6-order-of-operations)
7. [Complete Example](#7-complete-example)

---

## 1. Property (Core Record)

One row = one property listing.

### Identity & Classification

| Field | Type | Required | Accepted Values / Notes |
|---|---|---|---|
| `title` | Text (max 200 chars) | **Yes** | Full listing title — e.g. `"4BR Modern Home in Westside"` |
| `description` | Long Text | **Yes** | Full property description. Plain text or HTML. |
| `type` | Choice | **Yes** | See [Property Type](#property-type) |
| `listing_type` | Choice | **Yes** | See [Listing Type](#listing-type) |
| `status` | Choice | **Yes** | See [Property Status](#property-status) |
| `condition` | Choice | No | See [Property Condition](#property-condition) · Default: `good` |

### Pricing

| Field | Type | Required | Notes |
|---|---|---|---|
| `price` | Decimal (up to 12 digits) | **Yes** | e.g. `250000.00` for sale · `2500.00` for monthly rental |
| `price_label` | Text (max 20 chars) | No | Appended to the price display. Use `/mo` for monthly rent, `/yr` for annual lease. Leave blank for sale prices. |

### Physical Specifications

| Field | Type | Required | Notes |
|---|---|---|---|
| `bedrooms` | Whole number ≥ 0 | No | Number of bedrooms. Default: `0` |
| `bathrooms` | Decimal (X.0 or X.5) | No | e.g. `2.0` · `2.5` · `3.0`. Default: `0` |
| `sqft` | Whole number ≥ 0 | No | Interior square footage. Default: `0` |
| `lot_size` | Decimal | No | Lot size in **acres** — e.g. `0.25` |
| `year_built` | 4-digit year | No | e.g. `2005` · `2018` |
| `garage` | Whole number ≥ 0 | No | Number of garage spaces. Default: `0` |
| `stories` | Whole number ≥ 1 | No | Number of floors. Default: `1` |

### Location

| Field | Type | Required | Notes |
|---|---|---|---|
| `address` | Text (max 200 chars) | **Yes** | Street address only — e.g. `"4210 Almeda Rd"` |
| `city` | Text (max 100 chars) | **Yes** | e.g. `"Houston"` |
| `state` | 2-letter code | **Yes** | US state abbreviation — e.g. `TX` · `CA` · `NY` · `FL` |
| `zip_code` | Text (max 10 chars) | **Yes** | e.g. `"77004"` |
| `neighborhood` | Text (max 100 chars) | No | e.g. `"Midtown"` · `"Heights"` |
| `cross_street` | Text (max 200 chars) | No | Nearest intersection — e.g. `"Main St & Oak Ave"` |
| `latitude` | Decimal (−90 to +90) | No | GPS latitude — e.g. `29.760427`. Needed for map view. |
| `longitude` | Decimal (−180 to +180) | No | GPS longitude — e.g. `-95.369804`. Needed for map view. |

> **Tip:** Use Google Maps or maps.google.com → right-click an address → "What's here?" to get lat/lng coordinates.

### Media & Virtual Tours

| Field | Type | Required | Notes |
|---|---|---|---|
| `virtual_tour_url` | URL | No | 360° tour embed link |
| `tour_360_url` | URL | No | Matterport or Zillow 3D Home URL |

### Visibility Flags

| Field | Type | Default | Notes |
|---|---|---|---|
| `is_published` | `true` / `false` | `false` | **Must be `true` for the property to appear on the website.** Set to `false` during bulk import to review before going live. |
| `is_featured` | `true` / `false` | `false` | Displays a "Featured" badge on the listing card. |
| `homepage_featured` | `true` / `false` | `false` | Shows the property in the "Available Now" section on the homepage. Independent of the featured badge. |

### Agent Assignment

| Field | Type | Required | Notes |
|---|---|---|---|
| `agent` | FK → Agent User | **Yes** | Every property must have an assigned agent. Reference by agent **email address** or **user ID**. Confirm agent accounts exist in the system first. |

> **Note:** The `slug` field (URL identifier) is **auto-generated** from the address + city. Do not set it manually.

---

## 2. Property Images

Multiple images per property. At least one should be marked as primary (this becomes the listing thumbnail).

| Field | Type | Required | Notes |
|---|---|---|---|
| `property` | FK → Property | **Yes** | Which property these images belong to |
| `image` | Image file / Cloudinary URL | **Yes** | Upload via admin panel or provide a Cloudinary URL |
| `caption` | Text (max 200 chars) | No | Short description — e.g. `"Front exterior"` · `"Kitchen"` |
| `is_primary` | `true` / `false` | No | **Only ONE image per property should be primary.** Default: `false`. The primary image appears as the listing card thumbnail. |
| `order` | Whole number ≥ 0 | No | Gallery sort order. `0` = first. Lower number = displayed earlier. |

**Recommended image order:**
```
order 0  → Primary exterior / front of property   (is_primary: true)
order 1  → Living room
order 2  → Kitchen
order 3  → Master bedroom
order 4  → Bathroom(s)
order 5+ → Additional rooms, backyard, amenities
```

---

## 3. Amenity Categories

Categories group individual amenities for organized display (e.g. "Interior Features", "Outdoor", "Security").

> **These must be created BEFORE properties and amenities.**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | Text (max 100 chars) | **Yes** | Category label — e.g. `"Interior"` · `"Outdoor"` · `"Utilities"` · `"Security"` · `"Parking"` |
| `icon` | Text (max 50 chars) | No | Lucide icon name — e.g. `home` · `wifi` · `car` · `shield` · `tree` |
| `order` | Whole number ≥ 0 | No | Display order on the property page. Lower = first. |

**Suggested standard categories:**

| Name | Icon |
|---|---|
| Interior Features | `home` |
| Kitchen & Appliances | `utensils` |
| Outdoor & Grounds | `tree` |
| Utilities & Climate | `thermometer` |
| Parking & Storage | `car` |
| Security & Access | `shield` |
| Community & Building | `building-2` |
| Pet Policy | `paw-print` |

---

## 4. Property Amenities

Individual amenity items attached to a specific property. A property can have as many amenity rows as needed.

| Field | Type | Required | Notes |
|---|---|---|---|
| `property` | FK → Property | **Yes** | Which property this amenity belongs to |
| `category` | FK → AmenityCategory | No | Optional grouping. Can be left blank. |
| `name` | Text (max 100 chars) | **Yes** | The amenity label — e.g. `"Swimming Pool"` · `"Central A/C"` · `"Hardwood Floors"` |

**Common amenity examples by category:**

| Category | Amenity Examples |
|---|---|
| Interior Features | Hardwood Floors, High Ceilings, Crown Molding, Walk-in Closet, Fireplace |
| Kitchen & Appliances | Granite Countertops, Stainless Steel Appliances, Dishwasher, Gas Range, Island Kitchen |
| Outdoor & Grounds | Swimming Pool, Covered Patio, Fenced Backyard, Balcony, Sprinkler System |
| Utilities & Climate | Central A/C, Central Heat, In-unit Washer/Dryer, Washer/Dryer Hookups, Solar Panels |
| Parking & Storage | 2-Car Garage, Covered Parking, EV Charging Station, Storage Unit |
| Security & Access | Gated Community, Security Camera, Alarm System, Keyless Entry |
| Community & Building | Gym/Fitness Center, Rooftop Deck, Concierge, Package Lockers, Elevator |
| Pet Policy | Pets Allowed, Cat Friendly, Dog Friendly (≤50 lbs), No Pets |

---

## 5. Enum Reference

Use these exact values when filling in choice fields.

### Property Type

| Use This Value | Displays As |
|---|---|
| `residential` | Residential |
| `commercial` | Commercial |
| `land` | Land |
| `condo` | Condo |
| `townhouse` | Townhouse |

### Listing Type

| Use This Value | Displays As |
|---|---|
| `for-sale` | For Sale |
| `for-rent` | For Rent |
| `for-lease` | For Lease |

### Property Status

| Use This Value | Displays As | When to Use |
|---|---|---|
| `available` | Available | Property is actively listed and available |
| `under-contract` | Under Contract | Offer accepted, deal not yet closed |
| `sold` | Sold | Sale completed |
| `rented` | Rented | Rental occupied |
| `off-market` | Off Market | Not actively listed |

### Property Condition

| Use This Value | Displays As |
|---|---|
| `new` | New Construction |
| `excellent` | Excellent |
| `good` | Good *(default)* |
| `fair` | Fair |

---

## 6. Order of Operations

Follow this sequence when doing a bulk import to avoid reference errors:

```
Step 1 → Confirm Agent accounts exist in the system
          (coordinate with admin — each property needs a valid agent assigned)

Step 2 → Create Amenity Categories
          (Interior, Outdoor, Utilities, etc.)

Step 3 → Create Properties
          (set is_published = false for review before go-live)

Step 4 → Upload Property Images
          (link each image to its property; mark one per property as is_primary = true)

Step 5 → Add Property Amenities
          (link each amenity to its property and category)

Step 6 → Review all listings in the admin panel

Step 7 → Set is_published = true for listings ready to go live
```

---

## 7. Complete Example

### Property Record

```
title:             "3-Bed Modern Home in Midtown"
description:       "Beautifully renovated 3-bedroom home in the heart of Midtown.
                   Open floor plan, chef's kitchen, and a private backyard.
                   Walking distance to restaurants, parks, and public transit."

type:              residential
listing_type:      for-rent
status:            available
condition:         excellent

price:             2800.00
price_label:       /mo

bedrooms:          3
bathrooms:         2.0
sqft:              1650
lot_size:          0.12
year_built:        2018
garage:            1
stories:           2

address:           "4210 Almeda Rd"
city:              "Houston"
state:             TX
zip_code:          77004
neighborhood:      "Midtown"
cross_street:      "Almeda Rd & Binz St"
latitude:          29.736400
longitude:         -95.369800

virtual_tour_url:  (leave blank if none)
tour_360_url:      (leave blank if none)

is_published:      false
is_featured:       false
homepage_featured: false

agent:             agent@haskerrealtygroup.com
```

### Images for This Property

```
Image 1:  url: [cloudinary-url]   is_primary: true    order: 0   caption: "Front exterior"
Image 2:  url: [cloudinary-url]   is_primary: false   order: 1   caption: "Living room"
Image 3:  url: [cloudinary-url]   is_primary: false   order: 2   caption: "Kitchen"
Image 4:  url: [cloudinary-url]   is_primary: false   order: 3   caption: "Master bedroom"
Image 5:  url: [cloudinary-url]   is_primary: false   order: 4   caption: "Backyard"
```

### Amenities for This Property

```
Swimming Pool          →  category: Outdoor & Grounds
Covered Patio          →  category: Outdoor & Grounds
Central A/C            →  category: Utilities & Climate
In-unit Washer/Dryer   →  category: Utilities & Climate
Hardwood Floors        →  category: Interior Features
Walk-in Closet         →  category: Interior Features
Granite Countertops    →  category: Kitchen & Appliances
Stainless Appliances   →  category: Kitchen & Appliances
1-Car Garage           →  category: Parking & Storage
Pets Allowed           →  category: Pet Policy
```

---

*Document maintained by Hasker & Co. — Engineering.*  
*For questions contact the platform team.*
