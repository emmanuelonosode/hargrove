export default function BlogLoading() {
  return (
    <div className="pt-20">
      {/* Header skeleton */}
      <div className="bg-brand-dark pt-16 pb-14 px-6 text-center">
        <div className="h-3 w-32 bg-white/10 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-56 bg-white/10 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-80 bg-white/10 rounded mx-auto animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-neutral-100 rounded-sm animate-pulse" />
          ))}
        </div>

        {/* Featured post skeleton */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 bg-white border border-neutral-100 rounded-sm overflow-hidden animate-pulse">
          <div className="aspect-[16/9] lg:aspect-auto bg-neutral-200" />
          <div className="p-8 lg:p-10 space-y-4">
            <div className="h-3 w-32 bg-neutral-200 rounded" />
            <div className="h-8 w-full bg-neutral-200 rounded" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded" />
            <div className="h-4 w-full bg-neutral-100 rounded" />
            <div className="h-4 w-5/6 bg-neutral-100 rounded" />
            <div className="h-4 w-2/3 bg-neutral-100 rounded" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-sm overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-neutral-200" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-16 bg-neutral-200 rounded" />
                <div className="h-5 w-full bg-neutral-200 rounded" />
                <div className="h-5 w-2/3 bg-neutral-200 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-3/4 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
