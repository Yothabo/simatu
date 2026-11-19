import { Block } from '../../features/admin/components/skeleton/SkeletonBlock';

export default function AdminLoadingScreen() {
  return (
    <main
      className="min-h-screen bg-white px-4 py-6"
      aria-busy="true"
      aria-label="Verifying admin access"
    >
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <Block height="2rem" width="8rem" />
          <Block height="2.5rem" width="2.5rem" radius="9999px" />
        </div>

        <div className="space-y-2">
          <Block height="1.75rem" width="12rem" />
          <Block height="1rem" width="18rem" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[#e5e5e5] p-4"
            >
              <Block height="0.875rem" width="5rem" />
              <Block height="2rem" width="7rem" />
              <Block height="0.75rem" width="9rem" />
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-[#e5e5e5] p-4">
          <Block height="1.25rem" width="10rem" />
          <Block height="3rem" />
          <Block height="3rem" />
          <Block height="3rem" />
        </div>
      </div>
    </main>
  );
}
