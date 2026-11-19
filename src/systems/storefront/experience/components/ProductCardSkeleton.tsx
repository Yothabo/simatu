export default function ProductCardSkeleton() {
  return (
    <div className="flex w-full flex-col">
      {/* Image placeholder — exact same aspect as real card */}
      <div className="aspect-[4/5] w-full animate-pulse bg-[#e5e5e5]" />

      {/* Text block — same padding, same spacing as real card */}
      <div className="mt-1 flex flex-col pt-3 pl-3">
        {/* Product name line */}
        <div className="h-5 w-2/3 animate-pulse bg-[#e5e5e5]" />
        {/* Price line */}
        <div className="mt-1 h-4 w-1/3 animate-pulse bg-[#e5e5e5]" />
      </div>
    </div>
  );
}
