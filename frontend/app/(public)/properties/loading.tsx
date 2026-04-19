export default function PropertiesLoading() {
  return (
    <div className="pt-20">
      {/* Search hero skeleton */}
      <div className="bg-brand-dark pt-14 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-9 w-48 bg-white/10 rounded-sm mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-white/10 rounded-sm mb-8 animate-pulse" />
          <div className="h-14 max-w-5xl bg-white/10 rounded-sm animate-pulse" />
        </div>
      </div>

      {/* Listings skeleton */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-neutral-100 rounded-sm animate-pulse" />
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-sm overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-neutral-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-16 bg-neutral-200 rounded" />
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                <div className="flex gap-3 pt-2">
                  <div className="h-4 w-12 bg-neutral-100 rounded" />
                  <div className="h-4 w-12 bg-neutral-100 rounded" />
                  <div className="h-4 w-16 bg-neutral-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
