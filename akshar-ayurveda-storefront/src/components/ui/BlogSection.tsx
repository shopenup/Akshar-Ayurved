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
    <section className={`relative py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header styled like template */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-[#F4E5DF] text-[#C77B62] text-sm font-semibold mb-3">Blog</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Our Latest News</h2>
        </div>

        {/* Three-column layout: two large cards + right inline list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left large card */}
          {posts[0] && (
            <article className="rounded-2xl border border-gray-100 shadow-md">
              <div className="relative h-64 rounded-xl overflow-hidden m-4 mb-0">
                <Image src={posts[0].image} alt={posts[0].title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
              <div className="px-6 pb-6 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <h4 className="font-semibold text-[#C77B62]">{posts[0].category}</h4>
                  <p className="text-gray-500">{posts[0].date}</p>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  <Link href={`/blogs/${posts[0].id}`}>{posts[0].title}</Link>
                </h3>
                <p className="text-gray-600 line-clamp-2">{posts[0].excerpt}</p>
              </div>
            </article>
          )}

          {/* Middle large card */}
          {posts[1] && (
            <article className="bg-white rounded-2xl border border-gray-100 shadow-md">
              <div className="relative h-64 rounded-xl overflow-hidden m-4 mb-0">
                <Image src={posts[1].image} alt={posts[1].title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
              </div>
              <div className="px-6 pb-6 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <h4 className="font-semibold text-[#C77B62]">{posts[1].category}</h4>
                  <p className="text-gray-500">{posts[1].date}</p>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  <Link href={`/blogs/${posts[1].id}`}>{posts[1].title}</Link>
                </h3>
                <p className="text-gray-600 line-clamp-2">{posts[1].excerpt}</p>
              </div>
            </article>
          )}

          {/* Right stacked inline list */}
          <div className="space-y-4">
            {[posts[2], posts[3], posts[4]].filter(Boolean).map((post, idx) => (
              <article key={(post as any).id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex">
                <div className="relative w-28 h-20 md:w-36 md:h-24 flex-shrink-0">
                  <Image src={(post as any).image} alt={(post as any).title} fill className="object-cover" sizes="(max-width: 768px) 112px, 144px" />
                </div>
                <div className="p-4 flex-1">
                  <h4 className="text-xs font-semibold text-[#C77B62] mb-1">{(post as any).category}</h4>
                  <h3 className="text-base font-semibold text-slate-800 leading-snug hover:text-[#C77B62] transition-colors">
                    <Link href={`/blogs/${(post as any).id}`}>{(post as any).title}</Link>
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Optional View All */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/blogs">
              <Button className="bg-[#cc8972] hover:bg-[#9b624f] text-white px-6 py-3 rounded-full">View All Blogs</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Background shapes */}
      <div className="pointer-events-none select-none absolute inset-0 -z-10">
        {/* <Image src="/assets/images/bg-shape6.png" alt="bg shape" width={420} height={220} className="hidden md:block absolute left-0 top-0 opacity-80" /> */}
        <Image src="/assets/images/bg-leaf6.png" alt="bg leaf" width={100} height={100} className="hidden md:block absolute left-4 bottom-0" />
      </div>
    </section>
  );
};

export default BlogSection;
