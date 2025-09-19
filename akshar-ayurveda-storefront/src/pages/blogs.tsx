import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button, BackToTop } from '../components/ui';
import { blogService, type BlogArticle } from '../lib/shopenup/blog';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const postsPerPage = 6;

  // Helper functions
  const extractTextFromBody = (body: string | { content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text: string;
    } | {
      type: string;
      content: Array<{
        type: string;
        content: Array<{
          type: string;
          text: string;
        }>;
      }>;
    }>;
  }> }): string => {
    if (typeof body === 'string') {
      // Remove HTML tags and get plain text
      return body.replace(/<[^>]*>/g, '').trim();
    } else if (body?.content) {
      // Extract text from JSON structure
      return body.content
        .map((item: {
          type: string;
          content?: Array<{
            type: string;
            text: string;
          } | {
            type: string;
            content: Array<{
              type: string;
              content: Array<{
                type: string;
                text: string;
              }>;
            }>;
          }>;
        }) => {
          if (item.type === 'paragraph') {
            const firstContent = item.content?.[0];
            return (firstContent && 'text' in firstContent) ? firstContent.text : '';
          } else if (item.type === 'heading') {
            const firstContent = item.content?.[0];
            return (firstContent && 'text' in firstContent) ? firstContent.text : '';
          } else if (item.type === 'bullet_list') {
            return item.content?.map((listItem) => {
              if ('content' in listItem) {
                const firstContent = listItem.content?.[0];
                if (firstContent && 'content' in firstContent) {
                  const textContent = firstContent.content?.[0];
                  return (textContent && 'text' in textContent) ? textContent.text : '';
                }
              }
              return '';
            }).join(' ') || '';
          }
          return '';
        })
        .join(' ')
        .trim();
    }
    return '';
  };

  const getExcerpt = (content: string | { content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text: string;
    } | {
      type: string;
      content: Array<{
        type: string;
        content: Array<{
          type: string;
          text: string;
        }>;
      }>;
    }>;
  }> }, maxLength: number = 150): string => {
    const text = extractTextFromBody(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getReadTime = (content: string | { content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text: string;
    } | {
      type: string;
      content: Array<{
        type: string;
        content: Array<{
          type: string;
          text: string;
        }>;
      }>;
    }>;
  }> }): string => {
    const text = extractTextFromBody(content);
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategory = (tags: string[]): string => {
    return tags.length > 0 ? tags[0] : 'General';
  };

  // Transform blog article to blog post format
  const transformBlogArticle = (article: BlogArticle): BlogPost => {
    return {
      id: article.id,
      title: article.title,
      excerpt: getExcerpt(article.body),
      content: article.body as any,
      image: article.thumbnail_image || '/images/blog-placeholder.jpg',
      author: article.author,
      date: formatDate(article.created_at),
      readTime: getReadTime(article.body),
      category: getCategory(article.tags),
      tags: article.tags,
    };
  };

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const articles = await blogService.getPublishedArticles();
        const transformedPosts = articles.map(transformBlogArticle);
        setAllBlogPosts(transformedPosts);

        const firstThreePosts = transformedPosts.slice(0, 3);
    firstThreePosts.forEach(post => {
      if (post.image) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = post.image;
        document.head.appendChild(link);
      }
    });
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        setAllBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

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

  // Loading state
  if (loading) {
    return (
      <>
        <Head>
          <title>Blogs - AKSHAR AYURVED</title>
          <meta name="description" content="Discover wellness insights, Ayurvedic remedies, and health tips from our expert blog." />
        </Head>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading blog posts...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Head>
          <title>Blogs - AKSHAR AYURVED</title>
          <meta name="description" content="Discover wellness insights, Ayurvedic remedies, and health tips from our expert blog." />
        </Head>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blog Posts</h1>
              <p className="text-red-600 mb-8">{error}</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

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
          {currentPosts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Blog Posts Found</h2>
              <p className="text-gray-600">No blog posts are available at the moment.</p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentPosts.map((post, index) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                    quality={85} 
                    placeholder="blur" 
                    blurDataURL={process.env.NEXT_PUBLIC_BLUR_DATA_URL} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/homeimage1.jpg';
                      }}
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
          )}

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
