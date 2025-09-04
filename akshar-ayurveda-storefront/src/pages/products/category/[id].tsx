// import React, { useState } from 'react';
// import { useRouter } from 'next/router';
// import { GetStaticPaths, GetStaticProps } from 'next';
// import { getCategoriesList } from '../../../lib/shopenup/categories';
// import { ProductGrid } from '@components/products';
// import { ProductFilter, ProductSearch } from '@components/ecommerce';
// import { Button, Badge } from '@components/ui';

// // Mock products data
// const mockProducts = [
//   {
//     id: '1',
//     name: 'Ashwagandha Churna - Natural Stress Relief',
//     description: 'Traditional Ayurvedic powder for stress relief and energy boost',
//     price: 299,
//     originalPrice: 399,
//     image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop',
//     category: 'health-care-energy-booster',
//     tags: ['Stress Relief', 'Energy', 'Natural'],
//     rating: 4.5,
//     reviewCount: 128,
//     inStock: true,
//   },
//   {
//     id: '2',
//     name: 'Triphala Churna - Digestive Health',
//     description: 'Three-fruit blend for digestive health and detoxification',
//     price: 199,
//     originalPrice: 249,
//     image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
//     category: 'natural-antacid',
//     tags: ['Digestive', 'Detox', 'Natural'],
//     rating: 4.8,
//     reviewCount: 95,
//     inStock: true,
//   },
//   {
//     id: '3',
//     name: 'Neem Oil - Natural Skin Care',
//     description: 'Pure neem oil for skin care and hair health',
//     price: 150,
//     image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
//     category: 'premium-cosmetics',
//     tags: ['Skin Care', 'Hair Care', 'Natural'],
//     rating: 4.2,
//     reviewCount: 67,
//     inStock: true,
//   },
//   {
//     id: '4',
//     name: 'Brahmi Vati - Memory Enhancement',
//     description: 'Traditional formulation for memory and cognitive function',
//     price: 350,
//     image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop',
//     category: 'ras-rasayan',
//     tags: ['Memory', 'Cognitive', 'Brain Health'],
//     rating: 4.6,
//     reviewCount: 89,
//     inStock: false,
//   },
//   {
//     id: '5',
//     name: 'Guggulu Vati - Joint Health',
//     description: 'Natural joint support and pain relief formulation',
//     price: 280,
//     originalPrice: 320,
//     image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
//     category: 'bone-joints-pain-reliever',
//     tags: ['Joint Health', 'Pain Relief', 'Natural'],
//     rating: 4.4,
//     reviewCount: 156,
//     inStock: true,
//   },
//   {
//     id: '6',
//     name: 'Gurmar Churna - Blood Sugar Control',
//     description: 'Natural blood sugar management and diabetes support',
//     price: 220,
//     image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&h=300&fit=crop',
//     category: 'diabetes-care',
//     tags: ['Blood Sugar', 'Diabetes', 'Natural'],
//     rating: 4.7,
//     reviewCount: 203,
//     inStock: true,
//   },
// ];

// interface ProductCategoryPageProps {
//   category: {
//     id: string;
//     name: string;
//     description: string;
//     imageUrl: string;
//     productCount: number;
//     isActive: boolean;
//   };
//   products: typeof mockProducts;
// }

// export default function ProductCategoryPage({ category, products }: ProductCategoryPageProps) {
//   const router = useRouter();
//   const [filteredProducts, setFilteredProducts] = useState(products);
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     if (!query.trim()) {
//       setFilteredProducts(products);
//       return;
//     }
    
//     const filtered = products.filter(product =>
//       product.name.toLowerCase().includes(query.toLowerCase()) ||
//       product.description.toLowerCase().includes(query.toLowerCase()) ||
//       product.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
//     );
//     setFilteredProducts(filtered);
//   };

//   const [selectedCategory, setSelectedCategory] = useState('all');

//   const handleCategoryChange = (category: string) => {
//     setSelectedCategory(category);
//     if (category === 'all') {
//       setFilteredProducts(products);
//     } else {
//       const filtered = products.filter(product => product.category === category);
//       setFilteredProducts(filtered);
//     }
//   };

//   const handleAddToCart = (productId: string) => {
//     // Handle add to cart logic
//     console.log('Adding to cart:', productId);
//   };

//   const handleAddToFavorites = (productId: string) => {
//     // Handle add to favorites logic
//     console.log('Adding to favorites:', productId);
//   };

//   const handleProductClick = (productId: string) => {
//     router.push(`/products/${productId}`);
//   };

//   if (!category) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
//             <p className="text-gray-600 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
//             <Button variant="primary" onClick={() => router.push('/')}>
//               Back to Home
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Category Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex items-center space-x-4 mb-4">
//             <Badge variant="primary" size="lg">
//               {category.name}
//             </Badge>
//             <span className="text-gray-500">
//               {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
//             </span>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
//           <p className="text-gray-600 max-w-3xl">{category.description}</p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Filters Sidebar */}
//           <div className="lg:col-span-1">
//             <ProductFilter
//               categories={['all', ...Array.from(new Set(products.map(p => p.category)))]}
//               selectedCategory={selectedCategory}
//               onCategoryChange={handleCategoryChange}
//               className="sticky top-8"
//             />
//           </div>

//           {/* Products Section */}
//           <div className="lg:col-span-3">
//             {/* Search and Sort */}
//             <div className="mb-6">
//               <ProductSearch
//                 onSearch={handleSearch}
//                 placeholder={`Search in ${category.name}...`}
//               />
//             </div>

//             {/* Products Grid */}
//             {filteredProducts.length > 0 ? (
//               <ProductGrid
//                 products={filteredProducts}
//                 onAddToCart={handleAddToCart}
//                 onAddToFavorites={handleAddToFavorites}
//                 onProductClick={handleProductClick}
//               />
//             ) : (
//               <div className="text-center py-12">
//                 <div className="mb-4">
//                   <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//                 <p className="text-gray-600 mb-4">
//                   {searchQuery 
//                     ? `No products match "${searchQuery}" in ${category.name}`
//                     : `No products available in ${category.name}`
//                   }
//                 </p>
//                 {searchQuery && (
//                   <Button 
//                     variant="secondary" 
//                     onClick={() => {
//                       setSearchQuery('');
//                       setFilteredProducts(products);
//                     }}
//                   >
//                     Clear Search
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export const getStaticPaths: GetStaticPaths = async () => {
//   const categories = await getCategoriesList();
//   const paths = categories.product_categories.map((category: any) => ({
//     params: { id: category.id },
//   }));
//   return { paths, fallback: false };
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   const categories = await getCategoriesList();
//   const categoryId = params?.['id'] as string;
//   const category = categories.product_categories.find((cat: any) => cat.id === categoryId);

//   if (!category) {
//     return { notFound: true };
//   }

//   // TODO: Fetch products for this category from backend if needed
//   return {
//     props: {
//       category,
//       products: [], // Replace with real products if you fetch them
//     },
//   };
// };
