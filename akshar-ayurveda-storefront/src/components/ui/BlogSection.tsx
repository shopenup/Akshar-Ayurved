import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './index';

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
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  className?: string;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  title = "BLOGS",
  subtitle,
  showViewAll = true,
  className = '',
}) => {
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
          {posts.map((post) => (
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
