import { Suspense } from "react";
import { fetchProperties, type PropertyListItemAPI } from "@/lib/properties";
import { PropertiesClient } from "@/components/public/PropertiesClient";

export const revalidate = 300;

export const metadata = {
  title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
  description:
    "Browse affordable apartments, rental homes, and homes for sale across America — Atlanta, Charlotte, Houston, Miami, Phoenix, Seattle and more. Honest prices, no hidden fees.",
  alternates: { canonical: "https://haskerrealtygroup.com/properties" },
  openGraph: {
    title: "Homes to Rent & Buy Across America | Hasker & Co. Realty Group",
    description: "Browse affordable rentals and homes for sale. Honest prices, no hidden fees.",
    type: "website",
    url: "https://haskerrealtygroup.com/properties",
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
  const minPrice    = params.minPrice     as string | undefined;
  const maxPrice    = params.maxPrice     as string | undefined;
  const listingType = params.listing_type as string | undefined;
  const sort        = params.sort         as string | undefined;
  const page        = params.page         as string | undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

  let results: PropertyListItemAPI[] = [];
  let total = 0;

  try {
    const data = await fetchProperties({
      listing_type: listingType,
      q,
      beds,
      min_price: minPrice,
      max_price: maxPrice,
      sort,
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
      { "@type": "ListItem", position: 2, name: "Properties", item: "https://haskerrealtygroup.com/properties" },
    ],
  };

  return (
    <main>
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
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialListingType={listingType}
          initialSort={sort ?? "newest"}
        />
      </Suspense>
    </main>
  );
}
