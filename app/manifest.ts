import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/config';

/**
 * Web Application Manifest for PWA and Mobile Web App SEO
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: SITE_CONFIG.themeColorDark,
    theme_color: SITE_CONFIG.themeColorDark,
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
