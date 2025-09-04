import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/layout';
import { Button, Card, Spinner } from '../components/ui';
import { useNewArrivals, useCategories, useCollections } from '../hooks/useShopenupProducts';

export default function TestShopenup() {
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError, refetch: refetchNewArrivals } = useNewArrivals(4);
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { collections, loading: collectionsLoading, error: collectionsError, refetch: refetchCollections } = useCollections();

  return (
    <Layout>
      <Head>
        <title>Test Shopenup Integration - AKSHAR AYURVED</title>
        <meta name="description" content="Test page for Shopenup integration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shopenup Integration Test</h1>
            <p className="text-lg text-gray-600">
              Testing the Shopenup platform integration
            </p>
          </div>

          {/* New Arrivals Test */}
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals Test</h2>
              <Button variant="outline" size="sm" onClick={refetchNewArrivals}>
                Refresh
              </Button>
            </div>
            
            {newArrivalsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : newArrivalsError ? (
              <div className="text-center py-8 text-red-600">
                Error: {newArrivalsError}
              </div>
            ) : (
              <div>
                <p className="text-green-600 mb-4">✅ Successfully loaded {newArrivals.length} products</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {newArrivals.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-600">₹{product.price}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Categories Test */}
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Categories Test</h2>
              <Button variant="outline" size="sm" onClick={refetchCategories}>
                Refresh
              </Button>
            </div>
            
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : categoriesError ? (
              <div className="text-center py-8 text-red-600">
                Error: {categoriesError}
              </div>
            ) : (
              <div>
                <p className="text-green-600 mb-4">✅ Successfully loaded {categories.length} categories</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.count} products</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Collections Test */}
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Collections Test</h2>
              <Button variant="outline" size="sm" onClick={refetchCollections}>
                Refresh
              </Button>
            </div>
            
            {collectionsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : collectionsError ? (
              <div className="text-center py-8 text-red-600">
                Error: {collectionsError}
              </div>
            ) : (
              <div>
                <p className="text-green-600 mb-4">✅ Successfully loaded {collections.length} collections</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                      <p className="text-sm text-gray-600">{collection.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Summary */}
          <Card className="p-6 bg-green-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Integration Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">New Arrivals:</span> {newArrivalsLoading ? 'Loading...' : newArrivalsError ? 'Error' : `${newArrivals.length} products`}
              </div>
              <div>
                <span className="font-medium">Categories:</span> {categoriesLoading ? 'Loading...' : categoriesError ? 'Error' : `${categories.length} categories`}
              </div>
              <div>
                <span className="font-medium">Collections:</span> {collectionsLoading ? 'Loading...' : collectionsError ? 'Error' : `${collections.length} collections`}
              </div>
            </div>
            
            {!newArrivalsLoading && !categoriesLoading && !collectionsLoading && 
             !newArrivalsError && !categoriesError && !collectionsError && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 font-medium">🎉 All Shopenup integrations are working correctly!</p>
                <p className="text-green-700 text-sm mt-1">The application is successfully loading data from the Shopenup platform.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
