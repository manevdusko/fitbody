import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import BlogCard from './BlogCard';

interface BlogPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  slug: string;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

const BlogSection: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentPosts();
  }, [currentLanguage]);

  const fetchRecentPosts = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      
      let url = `${apiUrl}/wp-json/fitbody/v1/blog/posts?per_page=3`;
      
      // Add language parameter for multilingual support
      if (currentLanguage && currentLanguage !== 'mk') {
        url += `&lang=${currentLanguage}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const postsData = await response.json();
      setPosts(postsData);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return (window as any).WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'https://fitbody.mk';
    }
    return 'https://fitbody.mk';
  };

  if (loading) {
    return (
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('blog.recentPosts')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-800"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-800 rounded mb-3"></div>
                  <div className="h-6 bg-gray-800 rounded mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    // Don't show the section if there are no posts, but show a placeholder if there's an error
    if (error) {
      return (
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('blog.recentPosts')}
              </h2>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('common.comingSoon')}</h3>
                <p className="text-gray-400 text-sm">
                  {t('blog.comingSoon')}
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return null; // Don't show the section if there are no posts and no error
  }

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('blog.recentPosts')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {t('blog.subtitle')}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {t('navigation.blog')} →
          </Link>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium text-lg"
          >
            {t('blog.title')} - {t('common.loadMore')} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;