import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

interface BlogPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
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

const BlogPostPage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for router to be ready before fetching
    if (router.isReady && router.query.slug) {
      fetchPost(router.query.slug as string);
    }
  }, [router.isReady, router.query.slug, currentLanguage]);

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      
      let url = `${getApiUrl()}/wp-json/fitbody/v1/blog/posts/${slug}`;
      
      // Add language parameter for multilingual support
      if (currentLanguage && currentLanguage !== 'mk') {
        url += `?lang=${currentLanguage}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Post not found');
      }

      const fetchedPost = await response.json();
      setPost(fetchedPost);

      // Fetch related posts
      if (fetchedPost.categories.length > 0) {
        let relatedUrl = `${getApiUrl()}/wp-json/fitbody/v1/blog/posts?categories=${fetchedPost.categories[0]}&per_page=3`;
        
        // Add language parameter for related posts
        if (currentLanguage && currentLanguage !== 'mk') {
          relatedUrl += `&lang=${currentLanguage}`;
        }
        
        const relatedResponse = await fetch(relatedUrl);
        if (relatedResponse.ok) {
          const related = await relatedResponse.json();
          // Filter out the current post from related posts
          const filteredRelated = related.filter((relatedPost: BlogPost) => relatedPost.id !== fetchedPost.id);
          setRelatedPosts(filteredRelated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch post:', err);
      router.push('/404');
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

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title.rendered,
        text: stripHtml(post.excerpt.rendered),
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/blog" className="text-orange-600 hover:text-orange-700">
            {t('blog.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title.rendered} - FitBody.mk Blog</title>
        <meta name="description" content={stripHtml(post.excerpt.rendered)} />
        <meta property="og:title" content={post.title.rendered} />
        <meta property="og:description" content={stripHtml(post.excerpt.rendered)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://fitbody.mk/blog/${post.slug}`} />
        {post._embedded?.['wp:featuredmedia']?.[0] && (
          <meta property="og:image" content={post._embedded['wp:featuredmedia'][0].source_url} />
        )}
        <meta name="article:published_time" content={post.date} />
        {post._embedded?.author?.[0] && (
          <meta name="article:author" content={post._embedded.author[0].name} />
        )}
      </Head>

      <div className="min-h-screen bg-black pt-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium"
            >
              <FiArrowLeft className="mr-2" />
              {t('blog.backToBlog')}
            </Link>
          </div>

          {/* Featured Image */}
          {post._embedded?.['wp:featuredmedia']?.[0] && (
            <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {post.title.rendered}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center text-sm text-gray-400 mb-6">
              <div className="flex items-center mr-6 mb-2">
                <FiCalendar className="mr-1" />
                <span>{formatDate(post.date)}</span>
              </div>
              {post._embedded?.author?.[0] && (
                <div className="flex items-center mr-6 mb-2">
                  <FiUser className="mr-1" />
                  <span>{post._embedded.author[0].name}</span>
                </div>
              )}
              <div className="flex items-center mr-6 mb-2">
                <FiClock className="mr-1" />
                <span>{calculateReadingTime(post.content.rendered)} {t('blog.readingTime')}</span>
              </div>
              <button
                onClick={sharePost}
                className="flex items-center text-orange-400 hover:text-orange-300 mb-2"
              >
                <FiShare2 className="mr-1" />
                {t('blog.sharePost')}
              </button>
            </div>

            {/* Categories and Tags */}
            {post._embedded?.['wp:term'] && (
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Categories */}
                {post._embedded['wp:term'][0]?.filter(term => term.taxonomy === 'category').length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-300 mr-2">{t('blog.categories')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {post._embedded['wp:term'][0]
                        .filter(term => term.taxonomy === 'category')
                        .map((category) => (
                          <span
                            key={category.id}
                            className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30"
                          >
                            {category.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post._embedded['wp:term'][1]?.filter(term => term.taxonomy === 'post_tag').length > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-300 mr-2">{t('blog.tags')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {post._embedded['wp:term'][1]
                        .filter(term => term.taxonomy === 'post_tag')
                        .slice(0, 5)
                        .map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded border border-gray-700"
                          >
                            #{tag.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:text-white prose-headings:font-semibold
                prose-p:text-white prose-p:leading-relaxed
                prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-orange-300
                prose-strong:text-white prose-strong:font-semibold
                prose-em:text-gray-100
                prose-img:rounded-lg prose-img:border prose-img:border-gray-700
                prose-blockquote:border-orange-500 prose-blockquote:text-white prose-blockquote:bg-gray-800/50 prose-blockquote:p-4 prose-blockquote:rounded
                prose-ul:text-white prose-ol:text-white prose-li:text-white
                prose-code:bg-gray-800 prose-code:text-orange-300 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
                prose-table:text-white
                prose-th:bg-gray-800 prose-th:text-white prose-th:border-gray-700
                prose-td:border-gray-700 prose-td:text-white"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">{t('blog.relatedPosts')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all duration-300">
                    {relatedPost._embedded?.['wp:featuredmedia']?.[0] && (
                      <div className="relative h-32">
                        <Image
                          src={relatedPost._embedded['wp:featuredmedia'][0].source_url}
                          alt={relatedPost._embedded['wp:featuredmedia'][0].alt_text || relatedPost.title.rendered}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        <Link 
                          href={`/blog/${relatedPost.slug}`}
                          className="text-white hover:text-orange-400 transition-colors"
                        >
                          {relatedPost.title.rendered}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(relatedPost.date)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;