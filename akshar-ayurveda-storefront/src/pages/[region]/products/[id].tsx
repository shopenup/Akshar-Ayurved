import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RegionProductDetails() {
  const router = useRouter();
  const { region, id } = router.query;

  useEffect(() => {
    if (region && id) {
      // Redirect to the main product page while preserving the region context
      router.replace(`/products/${id}`);
    }
  }, [region, id, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        <p className="text-gray-600">Redirecting to product details...</p>
      </div>
    </div>
  );
}
