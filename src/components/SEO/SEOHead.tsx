/**
 * SEO Head Component for FitBody.mk
 * Comprehensive meta tags and SEO optimization
 */

import React from 'react';
import Head from 'next/head';
import { SEOData, generateCanonicalURL, generateOGImage } from '@/utils/seoUtils';
import { Product } from '@/types';

interface SEOHeadProps extends SEOData {
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots = 'index, follow',
  author = 'FitBody.mk',
  publishedTime,
  modifiedTime,
  locale = 'mk_MK',
  alternateLocales = ['en_US'],
  children
}) => {
  const finalCanonical = canonical || generateCanonicalURL('');
  const finalOGImage = ogImage || generateOGImage('default');
  const finalOGTitle = ogTitle || title;
  const finalOGDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;
  const finalTwitterImage = twitterImage || finalOGImage;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Macedonian" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="web" />
      <meta name="rating" content="general" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalOGTitle} />
      <meta property="og:description" content={finalOGDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalOGImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FitBody.mk" />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={finalTwitterImage} />
      <meta name="twitter:site" content="@goldtouchnutrition.mk" />
      <meta name="twitter:creator" content="@goldtouchnutrition.mk" />
      
      {/* Article Meta Tags (for blog posts/products) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      <meta property="article:author" content="FitBody.mk" />
      <meta property="article:section" content="Суплементи" />
      <meta property="article:tag" content="суплементи, протеини, креатин, фитнес" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="FitBody.mk" />
      <meta name="apple-mobile-web-app-title" content="FitBody.mk" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fitbody.mk" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//fitbody.mk" />
      
      {/* Structured Data will be added by specific schema components */}
      
      {children}
    </Head>
  );
};

// Specialized SEO components for different page types

interface ProductSEOProps {
  product: Product;
  category?: string;
}

export const ProductSEO: React.FC<ProductSEOProps> = ({ product, category }) => {
  const title = `${product.name} - Купи Онлајн | FitBody.mk`;
  const description = `${product.short_description || product.description} ✓ Оригинален производ ✓ Брза достава ✓ Најдобри цени во Македонија`;
  const keywords = `${product.name}, ${category || product.categories[0]?.name}, суплементи македонија, протеини, креатин, фитнес`;
  const canonical = generateCanonicalURL(`/products/${product.slug}`);
  const ogImage = product.images[0]?.src || generateOGImage('product');

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonical={canonical}
      ogTitle={title}
      ogDescription={description}
      ogImage={ogImage}
      ogType="product"
      robots="index, follow"
    />
  );
};

interface CategorySEOProps {
  categoryName: string;
  description: string;
  productCount?: number;
}

export const CategorySEO: React.FC<CategorySEOProps> = ({ 
  categoryName, 
  description, 
  productCount 
}) => {
  const title = `${categoryName} - Најдобри Цени | FitBody.mk`;
  const metaDescription = `${description} Огромен избор од ${productCount || 'многу'} производи. Брза достава низ цела Македонија.`;
  const keywords = `${categoryName}, суплементи македонија, ${categoryName.toLowerCase()}, фитнес, спортска исхрана`;
  const canonical = generateCanonicalURL(`/products?category=${encodeURIComponent(categoryName)}`);

  return (
    <SEOHead
      title={title}
      description={metaDescription}
      keywords={keywords}
      canonical={canonical}
      ogTitle={title}
      ogDescription={metaDescription}
      ogType="website"
      robots="index, follow"
    />
  );
};

interface HomeSEOProps {
  featuredProductsCount?: number;
  categoriesCount?: number;
}

export const HomeSEO: React.FC<HomeSEOProps> = ({ 
  featuredProductsCount, 
  categoriesCount 
}) => {
  const title = 'FitBody.mk - Суплементи и Спортска Исхрана #1 во Македонија';
  const description = 'Најголема онлајн продавница за суплементи во Македонија. Протеини, креатин, витамини, пре-воркаут. ✓ Оригинални производи ✓ Брза достава ✓ Најдобри цени';
  const keywords = 'суплементи македонија, протеини македонија, креатин македонија, витамини македонија, спортска исхрана, фитнес суплементи, бодибилдинг, whey протеин, масс гејнер';
  const canonical = generateCanonicalURL('/');

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonical={canonical}
      ogTitle={title}
      ogDescription={description}
      ogType="website"
      robots="index, follow"
    />
  );
};

interface AboutSEOProps {}

export const AboutSEO: React.FC<AboutSEOProps> = () => {
  const title = 'За Нас - FitBody.mk | Водечки Дистрибутер на Суплементи';
  const description = 'Запознајте се со ОСОГОВКА ДООЕЛ и Fit Body - водечки дистрибутер на суплементи и здрава храна во Македонија од 1991 година. Наша мисија е да ви помогнеме да ги постигнете вашите фитнес цели.';
  const keywords = 'за нас, fitbody македонија, осоговка дооел, дистрибутер суплементи, историја, мисија, визија';
  const canonical = generateCanonicalURL('/about');

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonical={canonical}
      ogTitle={title}
      ogDescription={description}
      ogType="website"
      robots="index, follow"
    />
  );
};

interface ContactSEOProps {}

export const ContactSEO: React.FC<ContactSEOProps> = () => {
  const title = 'Контакт - FitBody.mk | Нарачај Телефонски или Онлајн';
  const description = 'Контактирајте не за нарачки, прашања или совети. Телефон: 075 55 55 11, Email: fitbody.mk@icloud.com. Работно време: 08:00-17:00, Сабота: 08:00-14:00';
  const keywords = 'контакт, телефон, email, адреса, работно време, нарачки, совети, поддршка';
  const canonical = generateCanonicalURL('/contact');

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonical={canonical}
      ogTitle={title}
      ogDescription={description}
      ogType="website"
      robots="index, follow"
    />
  );
};

export default SEOHead;