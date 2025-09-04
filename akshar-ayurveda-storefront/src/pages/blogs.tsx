import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button, BackToTop } from '../components/ui';

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // All blog posts data
  const allBlogPosts = [
    {
      id: '1',
      title: 'Understanding Blood Pressure and Natural Remedies',
      excerpt: 'Learn about natural ways to manage blood pressure through Ayurvedic practices and herbal remedies. Discover how traditional medicine can help maintain healthy blood pressure levels.',
      content: `Blood pressure management is crucial for overall health and well-being. In Ayurveda, we believe that maintaining balance in the body's doshas (Vata, Pitta, Kapha) is essential for healthy blood pressure.

      Natural remedies like Arjuna bark, Sarpagandha, and Jatamansi have been used for centuries to support cardiovascular health. These herbs work by strengthening the heart muscles and improving blood circulation.

      Lifestyle modifications including regular exercise, stress management through yoga and meditation, and a balanced diet rich in potassium and magnesium can significantly impact blood pressure levels.

      Remember to consult with a healthcare professional before starting any new supplement regimen, especially if you're already on medication.`,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      author: 'Dr. Priya Sharma',
      date: 'Dec 15, 2024',
      readTime: '5 min read',
      category: 'Health',
      tags: ['Blood Pressure', 'Cardiovascular Health', 'Natural Remedies']
    },
    {
      id: '2',
      title: 'The Power of Turmeric in Daily Wellness',
      excerpt: 'Discover the incredible health benefits of turmeric and how to incorporate it into your daily routine for optimal wellness and natural healing.',
      content: `Turmeric, known as "Haldi" in Hindi, has been a cornerstone of Ayurvedic medicine for thousands of years. Its active compound, curcumin, possesses powerful anti-inflammatory and antioxidant properties.

      Regular consumption of turmeric can help reduce inflammation, boost immunity, improve digestion, and support joint health. The golden spice is particularly effective when combined with black pepper, which enhances curcumin absorption.

      You can incorporate turmeric into your daily routine through golden milk, turmeric tea, or by adding it to your cooking. For maximum benefits, consider taking standardized turmeric supplements.

      Studies have shown that turmeric may help with conditions like arthritis, digestive issues, and even support brain health. However, it's important to use high-quality, organic turmeric for best results.`,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      author: 'Ayurvedic Expert',
      date: 'Dec 12, 2024',
      readTime: '4 min read',
      category: 'Wellness',
      tags: ['Turmeric', 'Anti-inflammatory', 'Immunity']
    },
    {
      id: '3',
      title: 'Seasonal Wellness: Winter Ayurvedic Practices',
      excerpt: 'Essential Ayurvedic practices and remedies to stay healthy during the winter season. Learn how to adapt your routine for optimal health in cold weather.',
      content: `Winter is the season of Kapha dosha, characterized by cold, heavy, and moist qualities. To maintain balance during this season, Ayurveda recommends specific practices and dietary modifications.

      Warming spices like ginger, cinnamon, and black pepper should be incorporated into your diet. These spices help stimulate digestion and keep the body warm from within.

      Daily practices like Abhyanga (self-massage with warm oil), steam therapy, and gentle yoga can help maintain circulation and prevent seasonal ailments.

      Herbal teas made with tulsi, ginger, and honey are excellent for boosting immunity during winter. Regular consumption of chyawanprash can also help strengthen the respiratory system.

      Remember to stay hydrated with warm water and herbal teas, as cold drinks can aggravate Kapha dosha.`,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop',
      author: 'Wellness Coach',
      date: 'Dec 10, 2024',
      readTime: '6 min read',
      category: 'Seasonal',
      tags: ['Winter Wellness', 'Kapha Dosha', 'Seasonal Health']
    },
    {
      id: '4',
      title: 'The Benefits of Ashwagandha for Stress Management',
      excerpt: 'Explore how Ashwagandha, the ancient adaptogenic herb, can help manage stress, improve sleep, and enhance overall well-being.',
      content: `Ashwagandha, also known as "Indian Ginseng," is one of the most revered herbs in Ayurveda for its adaptogenic properties. It helps the body adapt to stress and maintain balance.

      Research has shown that Ashwagandha can significantly reduce cortisol levels, the body's primary stress hormone. This makes it an excellent natural remedy for stress management and anxiety.

      The herb also supports better sleep quality by calming the nervous system and reducing racing thoughts. Many people report improved sleep patterns after taking Ashwagandha regularly.

      Ashwagandha is available in various forms including powder, capsules, and liquid extracts. For best results, take it consistently for at least 6-8 weeks to experience its full benefits.

      It's important to note that Ashwagandha is generally safe but should be avoided during pregnancy and by those with autoimmune conditions.`,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=250&fit=crop',
      author: 'Dr. Rajesh Kumar',
      date: 'Dec 8, 2024',
      readTime: '5 min read',
      category: 'Wellness',
      tags: ['Ashwagandha', 'Stress Management', 'Adaptogens']
    },
    {
      id: '5',
      title: 'Natural Detoxification with Triphala',
      excerpt: 'Learn about Triphala, the traditional three-fruit formula that supports natural detoxification and digestive health.',
      content: `Triphala, meaning "three fruits" in Sanskrit, is a traditional Ayurvedic formula made from Amalaki (Indian Gooseberry), Bibhitaki, and Haritaki. This powerful combination has been used for centuries for natural detoxification.

      Each fruit in Triphala has specific properties: Amalaki is rich in Vitamin C and supports immunity, Bibhitaki helps with respiratory health, and Haritaki supports digestive function.

      Triphala is particularly effective for gentle daily detoxification without causing dependency or harsh side effects. It helps regulate bowel movements and supports the body's natural elimination processes.

      The best time to take Triphala is on an empty stomach, either early morning or before bed. Start with a small dose and gradually increase as your body adjusts.

      Triphala is also available in various forms including powder, tablets, and liquid extracts. The powder form can be mixed with warm water or honey for easier consumption.`,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      author: 'Ayurvedic Practitioner',
      date: 'Dec 5, 2024',
      readTime: '4 min read',
      category: 'Health',
      tags: ['Triphala', 'Detoxification', 'Digestive Health']
    },
    {
      id: '6',
      title: 'Managing Diabetes with Ayurvedic Principles',
      excerpt: 'Discover how Ayurvedic principles and natural remedies can support diabetes management alongside conventional treatment.',
      content: `Diabetes management in Ayurveda focuses on balancing blood sugar levels through diet, lifestyle modifications, and natural remedies. The approach is holistic and considers the individual's unique constitution.

      Key herbs for diabetes management include Gurmar (Gymnema Sylvestre), which helps reduce sugar cravings, and Neem, which supports pancreatic function. Bitter gourd and fenugreek are also beneficial.

      Dietary recommendations include avoiding refined sugars, incorporating bitter and astringent tastes, and eating at regular intervals. Complex carbohydrates and fiber-rich foods are preferred.

      Regular exercise, stress management, and adequate sleep are crucial components of diabetes management. Yoga and meditation can help reduce stress hormones that affect blood sugar levels.

      It's essential to work with healthcare professionals and monitor blood sugar levels regularly while incorporating Ayurvedic practices.`,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop',
      author: 'Dr. Anjali Patel',
      date: 'Dec 3, 2024',
      readTime: '7 min read',
      category: 'Health',
      tags: ['Diabetes', 'Blood Sugar', 'Natural Management']
    }
  ];

  // Filter posts by category
  const filteredPosts = selectedCategory === 'all' 
    ? allBlogPosts 
    : allBlogPosts.filter(post => post.category.toLowerCase() === selectedCategory.toLowerCase());

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(allBlogPosts.map(post => post.category)))];

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <>
      <Head>
        <title>Blogs - AKSHAR AYURVED</title>
        <meta name="description" content="Discover wellness insights, Ayurvedic remedies, and health tips from our expert blog." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover wellness insights, Ayurvedic remedies, and expert health tips to support your holistic wellness journey.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link href={`/blogs/${post.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                    >
                      Read More
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Back to Home */}
                     <div className="text-center mt-12">
             <Link href="/">
               <Button variant="primary" size="lg">
                 Back to Home
               </Button>
             </Link>
           </div>
         </div>

         {/* Back to Top Button */}
         <BackToTop />
       </div>
     </>
   );
 }
