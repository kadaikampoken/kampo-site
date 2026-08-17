/**
 * app/loading.tsx  （項目21：Loading）
 * ルートレベルのローディングUI
 */
import { Loading } from '@/components/common/loading';

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <Loading />
    </div>
  );
}
