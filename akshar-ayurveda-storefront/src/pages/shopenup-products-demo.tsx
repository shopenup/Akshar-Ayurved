import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '../components/layout';
import { Button, Card, Badge, Spinner, Alert } from '../components/ui';
import { 
  useProducts, 
  useNewArrivals, 
  useFeaturedProducts, 
  useProductsOnSale, 
  useCategories, 
  useCollections
} from '../hooks/useShopenupProducts';
import { type Product, type ProductCategory, type ProductCollection } from '../lib/shopenup/product';

export default function ShopenupProductsDemo() {
  // Use all the Shopenup product hooks
  const { products: allProducts, loading: allProductsLoading, error: allProductsError, refetch: refetchAllProducts } = useProducts({ limit: 12 });
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError, refetch: refetchNewArrivals } = useNewArrivals(6);
  const { products: featuredProducts, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useFeaturedProducts(6);
  const { products: productsOnSale, loading: saleLoading, error: saleError, refetch: refetchSale } = useProductsOnSale(6);
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { collections, loading: collectionsLoading, error: collectionsError, refetch: refetchCollections } = useCollections();

  const handleProductClick = (productId: string) => {
    window.location.href = `/products/${productId}`;
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center py-8">
      <Spinner size="lg" />
    </div>
  );

  const ErrorMessage = ({ error }: { error: string }) => (
    <Alert type="error" message={`Error: ${error}`} className="mb-4" />
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="relative mb-4">
        <Image
          src={product.thumbnail || product.images?.[0] || `https://dummyimage.com/300x300/4ade80/ffffff?text=${encodeURIComponent(product.title)}`}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-48 object-cover rounded-lg"
        />
        {!product.inStock && (
          <Badge variant="danger" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <Badge variant="success" className="absolute top-2 left-2">
            Sale
          </Badge>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.title}</h3>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-green-600">₹{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-sm text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="primary" 
          size="sm" 
          className="flex-1"
          onClick={() => handleProductClick(product.id)}
        >
          View Details
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddToCart(product.id)}
          disabled={!product.inStock}
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );

  const CategoryCard = ({ category }: { category: ProductCategory }) => (
    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
      <Image
        src={category.image || `https://dummyimage.com/200x200/4ade80/ffffff?text=${encodeURIComponent(category.name)}`}
        alt={category.name}
        width={200}
        height={200}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
      <p className="text-sm text-gray-500">{category.count} products</p>
    </Card>
  );

  const CollectionCard = ({ collection }: { collection: ProductCollection }) => (
    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
      <Image
        src={collection.image || `https://dummyimage.com/200x200/22c55e/ffffff?text=${encodeURIComponent(collection.title)}`}
        alt={collection.title}
        width={200}
        height={200}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold text-gray-900 mb-1">{collection.title}</h3>
      <p className="text-sm text-gray-500">{collection.description}</p>
      <p className="text-xs text-gray-400 mt-1">{collection.products?.length || 0} products</p>
    </Card>
  );

  return (
    <Layout>
      <Head>
        <title>Shopenup Products Demo - AKSHAR AYURVED</title>
        <meta name="description" content="Demo of Shopenup product integration showing real-time data from the platform" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shopenup Products Demo</h1>
            <p className="text-lg text-gray-600 mb-6">
              This page demonstrates how the application loads product data from the Shopenup platform
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="primary" onClick={refetchAllProducts}>
                Refresh All Products
              </Button>
              <Link href="/shopenup-demo">
                <Button variant="outline">
                  View Cart & Payment Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Product Categories</h2>
              <Button variant="outline" size="sm" onClick={refetchCategories}>
                Refresh
              </Button>
            </div>
            {categoriesLoading ? (
              <LoadingSpinner />
            ) : categoriesError ? (
              <ErrorMessage error={categoriesError} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </section>

          {/* Collections Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Product Collections</h2>
              <Button variant="outline" size="sm" onClick={refetchCollections}>
                Refresh
              </Button>
            </div>
            {collectionsLoading ? (
              <LoadingSpinner />
            ) : collectionsError ? (
              <ErrorMessage error={collectionsError} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            )}
          </section>

          {/* New Arrivals Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <Button variant="outline" size="sm" onClick={refetchNewArrivals}>
                Refresh
              </Button>
            </div>
            {newArrivalsLoading ? (
              <LoadingSpinner />
            ) : newArrivalsError ? (
              <ErrorMessage error={newArrivalsError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Featured Products Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <Button variant="outline" size="sm" onClick={refetchFeatured}>
                Refresh
              </Button>
            </div>
            {featuredLoading ? (
              <LoadingSpinner />
            ) : featuredError ? (
              <ErrorMessage error={featuredError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Products on Sale Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Products on Sale</h2>
              <Button variant="outline" size="sm" onClick={refetchSale}>
                Refresh
              </Button>
            </div>
            {saleLoading ? (
              <LoadingSpinner />
            ) : saleError ? (
              <ErrorMessage error={saleError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsOnSale.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* All Products Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <Button variant="outline" size="sm" onClick={refetchAllProducts}>
                Refresh
              </Button>
            </div>
            {allProductsLoading ? (
              <LoadingSpinner />
            ) : allProductsError ? (
              <ErrorMessage error={allProductsError} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Status Information */}
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Categories:</span> {categoriesLoading ? 'Loading...' : categories.length}
              </div>
              <div>
                <span className="font-medium">Collections:</span> {collectionsLoading ? 'Loading...' : collections.length}
              </div>
              <div>
                <span className="font-medium">New Arrivals:</span> {newArrivalsLoading ? 'Loading...' : newArrivals.length}
              </div>
              <div>
                <span className="font-medium">Featured Products:</span> {featuredLoading ? 'Loading...' : featuredProducts.length}
              </div>
              <div>
                <span className="font-medium">Products on Sale:</span> {saleLoading ? 'Loading...' : productsOnSale.length}
              </div>
              <div>
                <span className="font-medium">Total Products:</span> {allProductsLoading ? 'Loading...' : allProducts.length}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
