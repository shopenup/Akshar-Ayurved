import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './index';
import { blogService, type BlogArticle } from '../../lib/shopenup/blog';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}


interface BlogSectionProps {
  posts?: BlogPost[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  className?: string;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  posts: staticPosts,
  title = "BLOGS",
  subtitle,
  showViewAll = true,
  className = '',
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      image: article.thumbnail_image || '/images/blog-placeholder.jpg',
      author: article.author,
      date: formatDate(article.created_at),
      readTime: getReadTime(article.body),
      category: getCategory(article.tags),
    };
  };

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If static posts are provided, use them
        if (staticPosts && staticPosts.length > 0) {
          setPosts(staticPosts);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API
        const articles = await blogService.getPublishedArticles();
        const transformedPosts = articles.slice(0, 6).map(transformBlogArticle); // Limit to 6 posts
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [staticPosts]);

  // Loading state
  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading blog posts...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // No posts state
  if (!posts || posts.length === 0) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-lg">No blog posts available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
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
                  loading={index < 3 ? "eager" : "lazy"} 
                  quality={75} 
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

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/blogs">
              <Button variant="primary" size="lg">
                View All Blogs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
