import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/config';

/**
 * Native Next.js App Router Robots Directive Generator
 * Defines indexing boundaries: allows public landing page indexing while
 * strictly forbidding search crawlers from scraping API endpoints and build chunks.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
