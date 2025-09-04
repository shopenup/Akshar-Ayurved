import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card, Badge } from '../../components/ui';

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const blogPost = {
    id: id as string,
    title: 'Understanding Blood Pressure and Natural Remedies',
    excerpt: 'Learn about natural ways to manage blood pressure through Ayurvedic practices and herbal remedies.',
    content: `
      <p>Blood pressure management is crucial for overall health. Ayurvedic practices offer natural solutions through herbs like Arjuna, Sarpagandha, and lifestyle modifications.</p>
      
      <h2>What is Blood Pressure?</h2>
      <p>Blood pressure is the force exerted by circulating blood against the walls of blood vessels. It consists of two measurements:</p>
      <ul>
        <li><strong>Systolic pressure:</strong> The pressure when the heart beats</li>
        <li><strong>Diastolic pressure:</strong> The pressure when the heart is at rest</li>
      </ul>
      
      <h2>Natural Remedies</h2>
      <h3>1. Arjuna (Terminalia arjuna)</h3>
      <p>Arjuna is one of the most effective herbs for cardiovascular health. It helps strengthen the heart muscles and regulate blood pressure naturally.</p>
      
      <h3>2. Sarpagandha (Rauwolfia serpentina)</h3>
      <p>This herb has been used traditionally for centuries to manage high blood pressure.</p>
      
      <h2>Lifestyle Modifications</h2>
      <ul>
        <li>Reduce salt intake</li>
        <li>Exercise regularly</li>
        <li>Practice meditation</li>
        <li>Get adequate sleep</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    author: 'Dr. Priya Sharma',
    date: 'Dec 15, 2024',
    readTime: '8 min read',
    category: 'Health',
    tags: ['Blood Pressure', 'Ayurveda', 'Herbs', 'Cardiovascular']
  };

  const relatedPosts = [
    {
      id: '2',
      title: 'The Power of Turmeric in Daily Wellness',
      excerpt: 'Discover the incredible health benefits of turmeric.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      author: 'Ayurvedic Expert',
      date: 'Dec 12, 2024',
      readTime: '4 min read',
      category: 'Wellness'
    },
    {
      id: '3',
      title: 'Seasonal Wellness: Winter Ayurvedic Practices',
      excerpt: 'Essential Ayurvedic practices for winter season.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop',
      author: 'Wellness Coach',
      date: 'Dec 10, 2024',
      readTime: '6 min read',
      category: 'Seasonal'
    }
  ];

  return (
    <>
      <Head>
        <title>{blogPost.title} - AKSHAR</title>
        <meta name="description" content={blogPost.excerpt} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/blogs" className="text-gray-500 hover:text-gray-700">
                  Blogs
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900">{blogPost.title}</span>
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8">
                <div className="mb-6">
                  <Badge variant="info">{blogPost.category}</Badge>
                  <span className="text-sm text-gray-500 ml-4">{blogPost.readTime}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{blogPost.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{blogPost.excerpt}</p>
                
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">{blogPost.author}</p>
                    <p className="text-sm text-gray-500">{blogPost.date}</p>
                  </div>
                </div>

                <Image
                  src={blogPost.image}
                  alt={blogPost.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg mb-8"
                />

                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`}>
                      <div className="flex space-x-3 group">
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={80}
                          height={60}
                          className="w-20 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
