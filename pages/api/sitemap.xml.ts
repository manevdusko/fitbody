/**
 * Dynamic Sitemap Generator for FitBody.mk
 * Generates XML sitemap with all products, categories, and pages
 */

import { NextApiRequest, NextApiResponse } from 'next';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Static pages configuration
const STATIC_PAGES: SitemapUrl[] = [
  {
    loc: 'https://fitbody.mk/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://fitbody.mk/products',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://fitbody.mk/about',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://fitbody.mk/contact',
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: 'https://fitbody.mk/promotions',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// Fetch products from WordPress API
async function fetchProducts(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch('https://fitbody.mk/wp-json/fitbody/v1/products?per_page=100');
    
    if (!response.ok) {
      console.error('Failed to fetch products for sitemap');
      return [];
    }
    
    const products = await response.json();
    
    return products.map((product: any) => ({
      loc: `https://fitbody.mk/products/${product.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.8,
      lastmod: new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

// Fetch categories from WordPress API
async function fetchCategories(): Promise<SitemapUrl[]> {
  try {
    const response = await fetch('https://fitbody.mk/wp-json/fitbody/v1/products/categories');
    
    if (!response.ok) {
      console.error('Failed to fetch categories for sitemap');
      return [];
    }
    
    const categories = await response.json();
    
    return categories.map((category: any) => ({
      loc: `https://fitbody.mk/products?category=${category.id}`,
      changefreq: 'weekly' as const,
      priority: 0.7,
      lastmod: new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

// Generate XML sitemap
function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => {
    return `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlElements}
</urlset>`;
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.setHeader('Content-Type', 'application/xml');

    // Fetch all URLs
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);

    // Combine all URLs
    const allUrls = [
      ...STATIC_PAGES,
      ...products,
      ...categories
    ];

    // Generate and return XML
    const sitemap = generateSitemapXML(allUrls);
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}