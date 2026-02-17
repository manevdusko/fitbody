import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact';
}

const BlogCard: React.FC<BlogCardProps> = ({ post, variant = 'default' }) => {
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [translatedCategories, setTranslatedCategories] = useState<{[key: number]: string}>({});

  useEffect(() => {
    // Fetch translated category names
    const fetchCategoryTranslations = async () => {
      if (!post._embedded?.['wp:term']?.[0]) return;
      
      const categories = post._embedded['wp:term'][0].filter(term => term.taxonomy === 'category');
      const translations: {[key: number]: string} = {};
      
      try {
        const apiUrl = getApiUrl();
        let url = `${apiUrl}/wp-json/fitbody/v1/blog/categories`;
        if (currentLanguage && currentLanguage !== 'mk') {
          url += `?lang=${currentLanguage}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const allCategories = await response.json();
          categories.forEach(category => {
            const translatedCat = allCategories.find((c: any) => c.id === category.id);
            if (translatedCat) {
              translations[category.id] = translatedCat.name;
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch category translation:', error);
      }
      
      setTranslatedCategories(translations);
    };
    
    fetchCategoryTranslations();
  }, [post, currentLanguage]);

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

  const handleCardClick = () => {
    router.push(`/blog/${post.slug}`);
  };

  if (variant === 'compact') {
    return (
      <article 
        onClick={handleCardClick}
        className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer"
      >
        <div className="flex">
          {/* Image */}
          {post._embedded?.['wp:featuredmedia']?.[0] && (
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-4 flex-1">
            {/* Title */}
            <h3 className="font-semibold mb-2 line-clamp-2 text-sm text-white group-hover:text-orange-400 transition-colors">
              {post.title.rendered}
            </h3>

            {/* Meta */}
            <div className="flex items-center text-xs text-gray-400">
              <FiCalendar className="mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      onClick={handleCardClick}
      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full"
    >
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
        <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-white hover:text-orange-400 transition-colors">
          {post.title.rendered}
        </h2>

        {/* Excerpt */}
        <div 
          className="text-white mb-4 line-clamp-3 leading-relaxed [&>p]:text-white [&>*]:text-white"
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
                  {translatedCategories[category.id] || category.name}
                </span>
              ))}
          </div>
        )}

        {/* Read More */}
        <div className="inline-flex items-center text-orange-400 hover:text-orange-300 font-medium">
          {t('blog.readMore')} →
        </div>
      </div>
    </article>
  );
};

export default BlogCard;