import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button, BackToTop } from '../../components/ui';
import { blogService, type BlogArticle } from '../../lib/shopenup/blog';
import Breadcrumb from '@components/about/Breadcrumb';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string | { content: Array<{
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
  }> };
  body: string | { content: Array<{
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
  }> };
  image: string;
  author: string;
  author_expert_title?: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
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

  const getExcerpt = (body: string | { content: Array<{
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
    const text = extractTextFromBody(body);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getReadTime = (body: string | { content: Array<{
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
    const text = extractTextFromBody(body);
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
      content: article.body,
      body: article.body,
      image: article.thumbnail_image || '/images/blog-placeholder.jpg',
      author: article.author,
      author_expert_title: article.author_expert_title,
      date: formatDate(article.created_at),
      readTime: getReadTime(article.body),
      category: getCategory(article.tags),
      tags: article.tags,
    };
  };

  // Fetch blog post and related posts
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the specific blog post
        const article = await blogService.getArticle(id);
        if (!article) {
          setError('Blog post not found');
          return;
        }
        
        const transformedPost = transformBlogArticle(article!);
        setPost(transformedPost);

        // Fetch related posts (same category)
        const allArticles = await blogService.getPublishedArticles();
        const relatedArticles = allArticles
          .filter(a => a.id !== id && a.tags.some(tag => article.tags.includes(tag)))
          .slice(0, 3);
        
        const transformedRelatedPosts = relatedArticles.map(transformBlogArticle);
        setRelatedPosts(transformedRelatedPosts);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading blog post...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blog Post</h1>
          <p className="text-red-600 mb-8">{error}</p>
          <Link href="/blogs">
            <Button variant="primary">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blogs">
            <Button variant="primary">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Blog Details Page
return (
  <>
    <Head>
      <title>{post.title} - AKSHAR Ayurveda</title>
      <meta name="description" content={post.excerpt} />
    </Head>
    
         {/* Breadcrumb */}
        <Breadcrumb
                title={post.title}
                crumbs={[
                  { label: 'Home', href: '/' },
                  { label: 'Blogs', href: '/blogs' },
                  { label: post.title }
                ]}
                imageSrc="/assets/images/bredcrumb-bg.jpg"
              />

    {/* Loading State */}
    {loading && (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-[#C77B62] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading blog post...</span>
          </div>
        </div>
      </div>
    )}

    {/* Error State */}
    {error && (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Error Loading Blog Post</h1>
          <p className="text-red-600 mb-8">{error}</p>
          <Link href="/blogs">
            <Button className="!bg-[#C77B62] !hover:bg-[#CD8973] text-white px-6 py-2 rounded-full">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    )}

    {/* Not Found State */}
    {!loading && !error && !post && (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blogs">
            <Button className="!bg-[#C77B62] !hover:bg-[#CD8973] text-white px-6 py-2 rounded-full">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    )}

    {/* Main Blog Content */}
    {!loading && !error && post && (
      <div className="bg-gray-50 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article */}
          <article className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg overflow-hidden mb-8 sm:mb-12">
            {/* Featured Image */}
            <div className="relative h-48 sm:h-64 md:h-96">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority={true}
                quality={85}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/homeimage1.jpg';
                }}
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <span className="bg-[#C77B62] text-white text-xs px-2 py-1 rounded-full shadow">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1 sm:gap-0">
                <span>{post.author}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>{post.date}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>{post.readTime}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">{post.title}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 sm:mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-2 sm:px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Body Content */}
              <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700">
                {typeof post.body === 'string' ? (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{post.body}</div>
                ) : (
                  <div>
                    {post.body?.content?.map((item: any, index: number) => {
                      if (item.type === 'paragraph') {
                        const text = item.content?.[0]?.text || '';
                        return (
                          <p key={index} className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                            {text}
                          </p>
                        );
                      } else if (item.type === 'heading') {
                        const HeadingTag = `h${item.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
                        const text = item.content?.[0]?.text || '';
                        return (
                          <HeadingTag key={index} className="font-bold text-slate-800 mb-2 sm:mb-3 mt-4 sm:mt-6 text-base sm:text-lg md:text-xl">
                            {text}
                          </HeadingTag>
                        );
                      } else if (item.type === 'bullet_list') {
                        return (
                          <ul key={index} className="list-disc list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">
                            {item.content?.map((li: any, liIndex: number) => {
                              const text = li.content?.[0]?.content?.[0]?.text || '';
                              return <li key={liIndex}>{text}</li>;
                            })}
                          </ul>
                        );
                      } else if (item.type === 'blockquote') {
                        const text = item.content?.[0]?.content?.[0]?.text || '';
                        return (
                          <blockquote
                            key={index}
                            className="border-l-4 border-[#C77B62] pl-3 sm:pl-4 italic my-3 sm:my-4 text-gray-600 text-sm sm:text-base"
                          >
                            {text}
                          </blockquote>
                        );
                      }
                      return null;
                    }) || 'No content available'}
                  </div>
                )}
              </div>

              {/* Author Bio */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F4E5DF] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-[#C77B62] font-semibold text-sm sm:text-base">
                      {post.author.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{post.author}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{post.author_expert_title || 'Ayurvedic Expert'}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {/* {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blogs/${relatedPost.id}`} className="group">
                    <article className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/blog-placeholder.jpg';
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#C77B62] text-white text-xs px-2 py-1 rounded-full shadow">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-[#C77B62] transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )} */}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/blogs">
              <Button variant='outline' className="!bg-white !text-[#C77B62] !border !border-[#C77B62] px-4 sm:px-6 py-2 rounded-full hover:!bg-[#C77B62] hover:!text-white transition-colors w-full sm:w-auto text-sm">
                ← Back to Blogs
              </Button>
            </Link>
            <Link href="/">
              <Button variant='outline' className="!bg-white !text-[#C77B62] !border !border-[#C77B62] px-4 sm:px-6 py-2 rounded-full hover:!bg-[#C77B62] hover:!text-white transition-colors w-full sm:w-auto text-sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to Top Button */}
        <BackToTop />
      </div>
    )}
  </>
);

}