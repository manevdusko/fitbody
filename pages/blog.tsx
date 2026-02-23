import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock, FiSearch } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

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

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const BlogPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const postsPerPage = 6;

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [currentLanguage]);

  useEffect(() => {
    fetchPosts(true);
  }, [searchTerm, selectedCategory]);

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const apiUrl = getApiUrl();
      console.log('Fetching blog posts from:', apiUrl);
      
      let url = `${apiUrl}/wp-json/fitbody/v1/blog/posts?per_page=${postsPerPage}&page=${currentPage}`;
      
      // Add language parameter for multilingual support
      if (currentLanguage && currentLanguage !== 'mk') {
        url += `&lang=${currentLanguage}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (selectedCategory) {
        url += `&categories=${selectedCategory}`;
      }

      console.log('Full blog posts URL:', url);
      const response = await fetch(url);
      
      console.log('Blog posts response status:', response.status);
      
      if (!response.ok) {
        console.error('Blog posts fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch posts');
      }

      const newPosts = await response.json();
      console.log('Blog posts received:', newPosts.length, 'posts');
      
      if (reset) {
        setPosts(newPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(newPosts.length === postsPerPage);
    } catch (err) {
      console.error('Blog posts error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let url = `${getApiUrl()}/wp-json/fitbody/v1/blog/categories?per_page=20`;
      
      // Add language parameter for multilingual support
      if (currentLanguage && currentLanguage !== 'mk') {
        url += `&lang=${currentLanguage}`;
      }
      
      console.log('Fetching categories from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const categoriesData = await response.json();
        console.log('Categories received:', categoriesData);
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const apiUrl = (window as any).WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'https://api.fitbody.mk';
      console.log('Blog API URL:', apiUrl);
      return apiUrl;
    }
    return 'https://api.fitbody.mk';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mk-MK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = stripHtml(content).split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(true);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  if (loading && posts.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Head>
        <title>{t('blog.title')} - FitBody.mk</title>
        <meta name="description" content={t('blog.subtitle')} />
        <meta property="og:title" content={`${t('blog.title')} - FitBody.mk`} />
        <meta property="og:description" content={t('blog.subtitle')} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-black pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('blog.title')}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {t('blog.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('blog.searchPosts')}</h3>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('blog.searchPosts')}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>

              {/* Categories */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('blog.categories')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === null
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {t('blog.allCategories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => fetchPosts(true)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {t('promotions.tryAgain')}
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8 max-w-md mx-auto">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('common.comingSoon')}</h3>
                    <p className="text-gray-400">
                      {t('blog.comingSoon')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {posts.map((post) => (
                      <article key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all duration-300">
                        {/* Featured Image */}
                        {post._embedded?.['wp:featuredmedia']?.[0] && (
                          <div className="relative h-48">
                            <Image
                              src={post._embedded['wp:featuredmedia'][0].source_url}
                              alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="p-6">
                          {/* Meta Info */}
                          <div className="flex items-center text-sm text-gray-400 mb-3">
                            <FiCalendar className="mr-1" />
                            <span className="mr-4">{formatDate(post.date)}</span>
                            {post._embedded?.author?.[0] && (
                              <>
                                <FiUser className="mr-1" />
                                <span className="mr-4">{post._embedded.author[0].name}</span>
                              </>
                            )}
                            <FiClock className="mr-1" />
                            <span>{calculateReadingTime(post.content.rendered)} {t('blog.readingTime')}</span>
                          </div>

                          {/* Title */}
                          <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="text-white hover:text-orange-400 transition-colors"
                            >
                              {post.title.rendered}
                            </Link>
                          </h2>

                          {/* Excerpt */}
                          <div 
                            className="text-gray-300 mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                          />

                          {/* Categories */}
                          {post._embedded?.['wp:term']?.[0] && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post._embedded['wp:term'][0]
                                .filter(term => term.taxonomy === 'category')
                                .slice(0, 3)
                                .map((category) => (
                                  <span
                                    key={category.id}
                                    className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30"
                                  >
                                    {category.name}
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Read More */}
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium"
                          >
                            {t('blog.readMore')} →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center">
                      <button
                        onClick={() => fetchPosts()}
                        disabled={loading}
                        className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? t('common.loadingMore') : t('common.loadMore')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;