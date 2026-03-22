export function CardSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
        <div className="h-3 bg-border-subtle rounded w-16"></div>
        <div className="h-3 bg-border-subtle rounded w-16"></div>
      </div>
      <div className="h-8 bg-border-subtle rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-border-subtle rounded w-full mb-2"></div>
      <div className="h-4 bg-border-subtle rounded w-5/6 mb-8 flex-grow"></div>
      <div className="flex justify-between items-center mt-auto pt-6 border-t border-border-subtle">
        <div className="flex gap-2">
          <div className="h-5 bg-border-subtle rounded w-12"></div>
          <div className="h-5 bg-border-subtle rounded w-16"></div>
        </div>
        <div className="w-8 h-8 rounded-full bg-border-subtle"></div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-16 border-b border-border-subtle pb-12">
        <div className="h-3 bg-border-subtle rounded w-32 mb-8"></div>
        <div className="h-16 bg-border-subtle rounded w-3/4 mb-8"></div>
        <div className="h-6 bg-border-subtle rounded w-full mb-2"></div>
        <div className="h-6 bg-border-subtle rounded w-5/6"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-border-subtle rounded w-full"></div>
        <div className="h-4 bg-border-subtle rounded w-full"></div>
        <div className="h-4 bg-border-subtle rounded w-5/6"></div>
      </div>
    </div>
  );
}
