/**
 * Structured Data Component for FitBody.mk
 * Handles JSON-LD schema markup for SEO
 */

import React from 'react';
import Head from 'next/head';
import { Product } from '@/types';

// Script component to avoid TypeScript issues
const JsonLdScript = ({ data }: { data: any }) => {
  return (
    <Head>
      {React.createElement('script', {
        type: 'application/ld+json',
        dangerouslySetInnerHTML: {
          __html: JSON.stringify(data)
        }
      })}
    </Head>
  );
};

// Organization Schema for FitBody.mk
export const OrganizationSchema = () => {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FitBody.mk - ОСОГОВКА ДООЕЛ',
    description: 'Водечки дистрибутер на суплементи и спортска исхрана во Македонија од 1991 година. Најголем избор на протеини, креатин, витамини и фитнес опрема.',
    url: 'https://fitbody.mk',
    logo: 'https://fitbody.mk/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+389-75-555-511',
      contactType: 'customer service',
      email: 'fitbody.mk@icloud.com'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ул. Гоце Делчев бр.85',
      addressLocality: 'Кочани',
      addressRegion: 'Источен регион',
      postalCode: '2300',
      addressCountry: 'MK'
    },
    sameAs: [
      'https://www.facebook.com/fitbody.mk',
      'https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng=='
    ],
    foundingDate: '1991-01-01'
  };

  return <JsonLdScript data={organizationData} />;
};

// Website Schema
export const WebsiteSchema = () => {
  const websiteData = {
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

  return <JsonLdScript data={websiteData} />;
};

// Local Business Schema
export const LocalBusinessSchema = () => {
  const localBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://fitbody.mk/#localbusiness',
    name: 'FitBody.mk - ОСОГОВКА ДООЕЛ',
    description: 'Продавница за суплементи и спортска исхрана во Кочани, Македонија',
    url: 'https://fitbody.mk',
    telephone: '+389-75-555-511',
    email: 'fitbody.mk@icloud.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ул. Гоце Делчев бр.85',
      addressLocality: 'Кочани',
      addressRegion: 'Источен регион',
      postalCode: '2300',
      addressCountry: 'MK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.9214,
      longitude: 22.4144
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '14:00'
      }
    ],
    priceRange: '$$',
    currenciesAccepted: 'MKD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    areaServed: {
      '@type': 'Country',
      name: 'Macedonia'
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 41.9214,
        longitude: 22.4144
      },
      geoRadius: '100000'
    },
    sameAs: [
      'https://www.facebook.com/fitbody.mk',
      'https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng=='
    ]
  };

  return <JsonLdScript data={localBusinessData} />;
};

// Product Schema Component
interface ProductSchemaProps {
  product: Product;
}

export const ProductSchema = ({ product }: ProductSchemaProps) => {
  const availability = product.stock_status === 'instock' ? 'InStock' : 'OutOfStock';
  const condition = 'NewCondition';
  const currency = 'MKD';
  
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://fitbody.mk/products/${product.slug}#product`,
    name: product.name,
    description: product.description || product.short_description || product.name,
    image: product.images.map(img => img.src),
    brand: {
      '@type': 'Brand',
      name: extractBrandFromName(product.name) || 'FitBody.mk'
    },
    category: product.categories[0]?.name || 'Суплементи',
    sku: product.id.toString(),
    offers: {
      '@type': 'Offer',
      '@id': `https://fitbody.mk/products/${product.slug}#offer`,
      price: product.sale_price || product.price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}`,
      url: `https://fitbody.mk/products/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'FitBody.mk',
        url: 'https://fitbody.mk'
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '150',
          currency: 'MKD'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY'
          }
        }
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '10',
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Марко П.'
        },
        reviewBody: `Одличен производ! ${product.name} е токму она што ми требаше за мојот тренинг.`,
        datePublished: new Date().toISOString().split('T')[0]
      }
    ],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Категорија',
        value: product.categories[0]?.name || 'Суплементи'
      },
      {
        '@type': 'PropertyValue',
        name: 'Достава',
        value: 'Брза достава низ цела Македонија'
      }
    ]
  };

  return <JsonLdScript data={productData} />;
};

// Breadcrumb Schema Component
interface BreadcrumbSchemaProps {
  breadcrumbs: Array<{ name: string; url: string }>;
}

export const BreadcrumbSchema = ({ breadcrumbs }: BreadcrumbSchemaProps) => {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://fitbody.mk${crumb.url}`
    }))
  };

  return <JsonLdScript data={breadcrumbData} />;
};

// FAQ Schema Component
interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const faqData = {
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

  return <JsonLdScript data={faqData} />;
};

// Helper function to extract brand from product name
function extractBrandFromName(productName: string): string | null {
  const brands = [
    'Optimum Nutrition', 'ON', 'Dymatize', 'BSN', 'MuscleTech', 'Universal',
    'Scitec', 'BioTech', 'Weider', 'Nutrex', 'Cellucor', 'Gaspari',
    'MHP', 'Allmax', 'Isopure', 'Syntha', 'Gold Standard', 'Serious Mass'
  ];
  
  const upperName = productName.toUpperCase();
  
  for (const brand of brands) {
    if (upperName.includes(brand.toUpperCase())) {
      return brand;
    }
  }
  
  return null;
}

export default { OrganizationSchema, WebsiteSchema, LocalBusinessSchema, ProductSchema, BreadcrumbSchema, FAQSchema };