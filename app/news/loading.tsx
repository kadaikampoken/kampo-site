import { CardSkeletonGrid } from '@/components/common/loading';

export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
      <div className="mb-8 h-9 w-48 animate-pulse rounded bg-sand-200" />
      <CardSkeletonGrid />
    </div>
  );
}
