import { Suspense } from "react";
import { fetchProperties, type PropertyListItemAPI } from "@/lib/properties";
import { PropertiesClient } from "@/components/public/PropertiesClient";

export const revalidate = 300;

export const metadata = {
  title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
  description:
    "Browse affordable apartments, rental homes, and homes for sale across America — Atlanta, Charlotte, Houston, Miami, Phoenix, Seattle and more. All homes inspected and move-in ready.",
  alternates: { canonical: "https://haskerrealtygroup.com/houses-for-rent" },
  openGraph: {
    title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
    description: "Browse affordable rentals and homes for sale. All homes inspected and move-in ready.",
    type: "website",
    url: "https://haskerrealtygroup.com/houses-for-rent",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 24;

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params      = await searchParams;
  const q           = params.q            as string | undefined;
  const beds        = params.beds         as string | undefined;
  const baths       = params.baths        as string | undefined;
  const minPrice    = params.minPrice     as string | undefined;
  const maxPrice    = params.maxPrice     as string | undefined;
  const minSqft     = params.minSqft      as string | undefined;
  const maxSqft     = params.maxSqft      as string | undefined;
  const propType    = params.type         as string | undefined;
  const pets        = params.pets         as string | undefined;
  const listingType = params.listing_type as string | undefined;
  const sort        = params.sort         as string | undefined;
  const page        = params.page         as string | undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  let results: PropertyListItemAPI[] = [];
  let total = 0;

  try {
    // When no sort is specified by the user, use "diverse" so properties from
    // the same street/estate don't cluster together on the default browse page.
    const effectiveSort = sort ?? "diverse";
    const data = await fetchProperties({
      listing_type: listingType,
      q,
      beds,
      baths,
      min_price: minPrice,
      max_price: maxPrice,
      min_sqft: minSqft,
      max_sqft: maxSqft,
      type: propType,
      pets,
      sort: effectiveSort,
      page_size: String(PAGE_SIZE),
      page: String(currentPage),
    });
    results = data.results;
    total   = data.count;
  } catch {
    /* API offline — render empty state */
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: "https://haskerrealtygroup.com" },
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/houses-for-rent" },
    ],
  };

  return (
    <main>
      <h1 className="sr-only">Affordable Homes &amp; Apartments for Rent | Hasker &amp; Co. Realty Group</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Suspense>
        <PropertiesClient
          initialResults={results}
          initialTotal={total}
          initialPage={currentPage}
          initialQ={q}
          initialBeds={beds}
          initialBaths={baths}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialMinSqft={minSqft}
          initialMaxSqft={maxSqft}
          initialType={propType}
          initialPets={pets}
          initialListingType={listingType}
          initialSort={sort ?? "diverse"}
        />
      </Suspense>
    </main>
  );
}
