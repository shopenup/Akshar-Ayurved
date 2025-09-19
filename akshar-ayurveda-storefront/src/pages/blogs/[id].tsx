import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button, BackToTop } from '../../components/ui';
import { blogService, type BlogArticle } from '../../lib/shopenup/blog';

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

  return (
    <>
      <Head>
        <title>{post.title} - AKSHAR Ayurveda</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-green-600">Home</Link></li>
              <li>/</li>
              <li><Link href="/blogs" className="hover:text-green-600">Blogs</Link></li>
              <li>/</li>
              <li className="text-gray-900">{post.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
            {/* Featured Image */}
            <div className="relative h-64 md:h-96">
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
              <div className="absolute top-4 left-4">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-8">
              {/* Meta Information */}
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>{post.author}</span>
                <span className="mx-2">•</span>
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none">
                {typeof post.body === 'string' ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {post.body}
                  </div>
                ) : (
                  <div>
                    {post.body?.content?.map((item: {
                      type: string;
                      attrs?: { level: number };
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
                    }, index: number) => {
                      if (item.type === 'paragraph') {
                        const firstContent = item.content?.[0];
                        const text = (firstContent && 'text' in firstContent) ? firstContent.text : '';
                        return (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {text}
                          </p>
                        );
                      } else if (item.type === 'heading') {
                        const HeadingTag = `h${item.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
                        const firstContent = item.content?.[0];
                        const text = (firstContent && 'text' in firstContent) ? firstContent.text : '';
                        return (
                          <HeadingTag key={index} className="font-bold text-gray-900 mb-3 mt-6">
                            {text}
                          </HeadingTag>
                        );
                      } else if (item.type === 'bullet_list') {
                        return (
                          <ul key={index} className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                            {item.content?.map((listItem, listIndex: number) => {
                              if ('content' in listItem) {
                                const firstContent = listItem.content?.[0];
                                if (firstContent && 'content' in firstContent) {
                                  const textContent = firstContent.content?.[0];
                                  const text = (textContent && 'text' in textContent) ? textContent.text : '';
                                  return (
                                    <li key={listIndex}>
                                      {text}
                                    </li>
                                  );
                                }
                              }
                              return <li key={listIndex}></li>;
                            })}
                          </ul>
                        );
                      } else if (item.type === 'blockquote') {
                        const firstContent = item.content?.[0];
                        let text = '';
                        if (firstContent && 'content' in firstContent) {
                          const textContent = firstContent.content?.[0];
                          text = (textContent && 'text' in textContent) ? String(textContent.text) : '';
                        }
                        return (
                          <blockquote key={index} className="border-l-4 border-green-500 pl-4 italic my-4 text-gray-600">
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
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-semibold">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-600">
                      {post.author_expert_title || 'Ayurvedic Expert'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blogs/${relatedPost.id}`}
                    className="group"
                  >
                    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link href="/blogs">
              <Button variant="outline">
                ← Back to Blogs
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary">
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