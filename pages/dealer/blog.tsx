import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiExternalLink, FiEdit } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/router';
import BlogCard from '@/components/Blog/BlogCard';

interface BlogPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  status: string;
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

const DealerBlogPage = () => {
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/dealer/login');
      return;
    }

    if (!user.is_dealer) {
      router.push('/');
      return;
    }

    fetchPosts();
  }, [user, router, currentLanguage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let url = `${getApiUrl()}/wp-json/fitbody/v1/blog/posts?per_page=20`;
      
      if (currentLanguage && currentLanguage !== 'mk') {
        url += `&lang=${currentLanguage}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return (window as any).WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'https://api.fitbody.mk';
    }
    return 'https://api.fitbody.mk';
  };

  if (!user || !user.is_dealer) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Blog Management - Dealer Dashboard</title>
        <meta name="description" content="Manage your blog posts" />
      </Head>

      <div className="min-h-screen bg-black pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dealer/dashboard"
              className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium mb-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Blog Management</h1>
                <p className="text-gray-300 mt-2">View and manage blog posts</p>
              </div>
            </div>
          </div>

          {/* WordPress Admin Integration */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center">
                  <FiEdit className="mr-2" />
                  Create & Edit Blog Posts
                </h3>
                <p className="text-gray-300 mb-4">
                  Use the WordPress admin panel to create and edit blog posts with the full rich text editor, 
                  image uploads, SEO settings, and multilingual support for all four languages.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>✓ Rich text editor with formatting options</p>
                  <p>✓ Image and media uploads</p>
                  <p>✓ Multilingual content (Macedonian, English, Spanish, Albanian)</p>
                  <p>✓ SEO optimization and meta tags</p>
                  <p>✓ Categories and tags management</p>
                </div>
              </div>
              <div className="ml-6 space-y-3">
                <a
                  href={`${getApiUrl()}/wp-admin/post-new.php`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiExternalLink className="mr-2" size={16} />
                  Create New Post
                </a>
                <br />
                <a
                  href={`${getApiUrl()}/wp-admin/edit.php`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <FiExternalLink className="mr-2" size={16} />
                  Manage All Posts
                </a>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Blog Posts</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-300 mt-4">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Blog Posts Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start creating engaging content for your customers using the WordPress admin panel.
                  </p>
                  <a
                    href={`${getApiUrl()}/wp-admin/post-new.php`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiExternalLink className="mr-2" />
                    Create First Post
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.slice(0, 6).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
                
                {posts.length > 6 && (
                  <div className="text-center mt-8">
                    <Link
                      href="/blog"
                      className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium"
                    >
                      View All Posts →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total Posts</h3>
              <p className="text-3xl font-bold text-orange-400">{posts.length}</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Published</h3>
              <p className="text-3xl font-bold text-green-400">
                {posts.filter(post => post.status === 'publish').length}
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Recent Activity</h3>
              <p className="text-sm text-gray-400">
                {posts.length > 0 
                  ? `Last post: ${new Date(posts[0]?.date).toLocaleDateString()}`
                  : 'No posts yet'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealerBlogPage;