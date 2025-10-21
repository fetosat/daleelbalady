import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/payment-checkout',
          '/payment-failed',
          '/payment-success',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/payment-checkout',
          '/payment-failed',
          '/payment-success',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/payment-checkout',
          '/payment-failed',
          '/payment-success',
        ],
      },
    ],
    sitemap: 'https://daleelbalady.com/sitemap.xml',
    host: 'https://daleelbalady.com',
  };
}
