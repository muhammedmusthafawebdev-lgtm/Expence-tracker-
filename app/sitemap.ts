import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/config';

/**
 * Native Next.js App Router Sitemap Generator
 * Emits XML sitemap entries containing only canonical public URLs.
 * Authenticated and private user views are strictly excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
