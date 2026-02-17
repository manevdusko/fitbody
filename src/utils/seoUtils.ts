/**
 * SEO Utilities for FitBody.mk
 * Comprehensive SEO helper functions for supplements/bodybuilding site
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
}

export interface ProductSEO {
  name: string;
  description: string;
  shortDescription?: string;
  price: string;
  currency: string;
  availability: string;
  condition: string;
  brand?: string;
  category: string;
  images: string[];
  sku?: string;
  gtin?: string;
  mpn?: string;
  rating?: number;
  reviewCount?: number;
  slug: string;
}

export interface OrganizationSEO {
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
  foundingDate?: string;
}

// Macedonian supplements/bodybuilding keywords
export const SUPPLEMENT_KEYWORDS = {
  primary: [
    'суплементи македонија',
    'протеини македонија',
    'креатин македонија',
    'витамини македонија',
    'спортска исхрана македонија',
    'фитнес суплементи',
    'бодибилдинг суплементи',
    'whey протеин',
    'масс гејнер',
    'пре воркаут',
    'пост воркаут',
    'амино киселини',
    'BCAA македонија',
    'глутамин македонија',
    'рибјо масло македонија',
    'мултивитамини македонија'
  ],
  longTail: [
    'најдобри протеини за маса македонија',
    'креатин монохидрат цена македонија',
    'whey протеин достава македонија',
    'суплементи за слабеење македонија',
    'протеини за жени македонија',
    'пре воркаут без кофеин македонија',
    'веган протеин македонија',
    'казеин протеин македонија',
    'суплементи за издржливост македонија',
    'витамини за спортисти македонија'
  ],
  local: [
    'суплементи скопје',
    'протеини скопје',
    'фитнес продавница скопје',
    'суплементи кочани',
    'спортска исхрана скопје',
    'бодибилдинг продавница македонија',
    'фитнес опрема македонија'
  ],
  brands: [
    'optimum nutrition македонија',
    'dymatize македонија',
    'bsn македонија',
    'muscletech македонија',
    'universal nutrition македонија',
    'scitec nutrition македонија',
    'biotech usa македонија'
  ]
};

export const CATEGORY_KEYWORDS = {
  proteins: [
    'whey протеин',
    'казеин протеин',
    'соја протеин',
    'веган протеин',
    'изолат протеин',
    'концентрат протеин',
    'хидролизат протеин'
  ],
  creatine: [
    'креатин монохидрат',
    'креатин хидрохлорид',
    'креатин алкалин',
    'микронизиран креатин',
    'креатин за сила',
    'креатин за маса'
  ],
  preworkout: [
    'пре воркаут',
    'енергетски напиток',
    'пре тренинг',
    'стимуланс',
    'пумп формула',
    'фокус формула'
  ],
  vitamins: [
    'мултивитамини',
    'витамин д',
    'витамин ц',
    'витамин б комплекс',
    'рибјо масло',
    'омега 3',
    'цинк',
    'магнезиум'
  ],
  weightLoss: [
    'фет бурнер',
    'л-карнитин',
    'cla',
    'термогеник',
    'апетит супресор',
    'детокс'
  ]
};

/**
 * Generate SEO-optimized title for different page types
 */
export function generateSEOTitle(
  baseName: string,
  pageType: 'product' | 'category' | 'home' | 'about' | 'contact' | 'blog',
  category?: string
): string {
  const siteName = 'FitBody.mk';
  
  switch (pageType) {
    case 'product':
      return `${baseName} - Купи Онлајн | ${siteName}`;
    case 'category':
      return `${baseName} - Најдобри Цени | ${siteName}`;
    case 'home':
      return `${siteName} - Суплементи и Спортска Исхрана #1 во Македонија`;
    case 'about':
      return `За Нас - ${siteName} | Водечки Дистрибутер на Суплементи`;
    case 'contact':
      return `Контакт - ${siteName} | Нарачај Телефонски или Онлајн`;
    default:
      return `${baseName} | ${siteName}`;
  }
}

/**
 * Generate SEO-optimized description
 */
export function generateSEODescription(
  content: string,
  pageType: 'product' | 'category' | 'home' | 'about' | 'contact',
  keywords?: string[]
): string {
  const maxLength = 155;
  const keywordPhrase = keywords ? keywords.slice(0, 2).join(', ') : '';
  
  let description = content;
  
  // Add call-to-action based on page type
  switch (pageType) {
    case 'product':
      description += ' ✓ Брза достава ✓ Најдобри цени ✓ Оригинални производи';
      break;
    case 'category':
      description += ' Огромен избор, најдобри цени, брза достава низ цела Македонија.';
      break;
    case 'home':
      description += ' Оригинални суплементи, брза достава, најдобри цени во Македонија.';
      break;
  }
  
  // Add keywords if provided
  if (keywordPhrase) {
    description = `${keywordPhrase} - ${description}`;
  }
  
  // Truncate if too long
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
}

/**
 * Generate keywords for different content types
 */
export function generateKeywords(
  baseKeywords: string[],
  category?: string,
  productName?: string
): string {
  let keywords = [...baseKeywords];
  
  // Add category-specific keywords
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('протеин')) {
      keywords.push(...CATEGORY_KEYWORDS.proteins);
    } else if (categoryLower.includes('креатин')) {
      keywords.push(...CATEGORY_KEYWORDS.creatine);
    } else if (categoryLower.includes('витамин')) {
      keywords.push(...CATEGORY_KEYWORDS.vitamins);
    } else if (categoryLower.includes('пре') || categoryLower.includes('pre')) {
      keywords.push(...CATEGORY_KEYWORDS.preworkout);
    }
  }
  
  // Add product-specific keywords
  if (productName) {
    const productLower = productName.toLowerCase();
    keywords.push(productName);
    
    // Add brand keywords if detected
    SUPPLEMENT_KEYWORDS.brands.forEach(brand => {
      const brandName = brand.split(' ')[0].toLowerCase();
      if (productLower.includes(brandName)) {
        keywords.push(brand);
      }
    });
  }
  
  // Add primary supplement keywords
  keywords.push(...SUPPLEMENT_KEYWORDS.primary.slice(0, 5));
  
  // Remove duplicates and limit to 20 keywords
  keywords = Array.from(new Set(keywords)).slice(0, 20);
  
  return keywords.join(', ');
}

/**
 * Generate canonical URL
 */
export function generateCanonicalURL(path: string): string {
  const baseURL = 'https://fitbody.mk';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImage(
  type: 'product' | 'category' | 'default',
  imageUrl?: string,
  title?: string
): string {
  if (imageUrl && type === 'product') {
    return imageUrl;
  }
  
  // Default OG image
  return 'https://fitbody.mk/images/og-default.jpg';
}

/**
 * Generate breadcrumb data
 */
export function generateBreadcrumbs(
  path: string,
  productName?: string,
  categoryName?: string
): Array<{ name: string; url: string }> {
  const breadcrumbs = [
    { name: 'Почетна', url: '/' }
  ];
  
  const pathSegments = path.split('/').filter(segment => segment);
  
  if (pathSegments.includes('products')) {
    breadcrumbs.push({ name: 'Производи', url: '/products' });
    
    if (categoryName) {
      breadcrumbs.push({ name: categoryName, url: `/products?category=${categoryName}` });
    }
    
    if (productName) {
      breadcrumbs.push({ name: productName, url: path });
    }
  } else if (pathSegments.includes('about')) {
    breadcrumbs.push({ name: 'За Нас', url: '/about' });
  } else if (pathSegments.includes('contact')) {
    breadcrumbs.push({ name: 'Контакт', url: '/contact' });
  }
  
  return breadcrumbs;
}

/**
 * Generate FAQ schema data for products
 */
export function generateProductFAQ(productName: string, category: string) {
  const faqs = [
    {
      question: `Дали ${productName} е оригинален производ?`,
      answer: `Да, сите наши производи се 100% оригинални и увезени директно од официјални дистрибутери. ${productName} доаѓа со сертификат за автентичност.`
    },
    {
      question: `Колку време е потребно за достава на ${productName}?`,
      answer: `Достава на ${productName} се врши во рок од 1-3 работни дена низ цела Македонија. За Скопје достава е можна истиот ден.`
    },
    {
      question: `Како да го користам ${productName}?`,
      answer: `Детални инструкции за користење на ${productName} се наоѓаат на пакувањето. За дополнителни прашања, контактирајте не на телефон или email.`
    }
  ];
  
  // Add category-specific FAQs
  if (category.toLowerCase().includes('протеин')) {
    faqs.push({
      question: `Кога е најдобро да се зема ${productName}?`,
      answer: `${productName} се препорачува да се зема по тренинг за оптимална синтеза на протеини, или како замена за оброк.`
    });
  }
  
  return faqs;
}

/**
 * Clean and optimize text for SEO
 */
export function cleanTextForSEO(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, 300); // Limit length
}

/**
 * Generate structured data for different content types
 */
export function generateStructuredData(
  type: 'product' | 'organization' | 'breadcrumb' | 'faq' | 'website',
  data: any
) {
  switch (type) {
    case 'product':
      return generateProductSchema(data);
    case 'organization':
      return generateOrganizationSchema(data);
    case 'breadcrumb':
      return generateBreadcrumbSchema(data);
    case 'faq':
      return generateFAQSchema(data);
    case 'website':
      return generateWebsiteSchema(data);
    default:
      return null;
  }
}

function generateProductSchema(product: ProductSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'FitBody.mk'
    },
    category: product.category,
    sku: product.sku,
    gtin: product.gtin,
    mpn: product.mpn,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      itemCondition: `https://schema.org/${product.condition}`,
      seller: {
        '@type': 'Organization',
        name: 'FitBody.mk'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1
    } : undefined
  };
}

function generateOrganizationSchema(org: OrganizationSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: org.contactPoint.telephone,
      contactType: org.contactPoint.contactType,
      email: org.contactPoint.email
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry
    },
    sameAs: org.sameAs,
    foundingDate: org.foundingDate
  };
}

function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://fitbody.mk${crumb.url}`
    }))
  };
}

function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

function generateWebsiteSchema(data: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FitBody.mk',
    alternateName: 'Fit Body Macedonia',
    url: 'https://fitbody.mk',
    description: 'Најголема онлајн продавница за суплементи и спортска исхрана во Македонија',
    inLanguage: 'mk-MK',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://fitbody.mk/products?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ОСОГОВКА ДООЕЛ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://fitbody.mk/images/logo.png'
      }
    }
  };
}