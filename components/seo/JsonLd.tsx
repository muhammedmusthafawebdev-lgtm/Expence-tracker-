import React from 'react';
import { SITE_CONFIG, getSiteUrl } from '@/lib/seo/config';

export function JsonLd() {
  const siteUrl = getSiteUrl();

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${siteUrl}/#webapp`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: siteUrl,
    description: SITE_CONFIG.description,
    applicationCategory: SITE_CONFIG.applicationCategory,
    operatingSystem: SITE_CONFIG.operatingSystem,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: 'en-US',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: SITE_CONFIG.currency,
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Daily income and categorized expense tracking with integer-paise precision',
      'Period budgets for monthly and yearly spending limits',
      'Ring-fenced savings milestone goals and allocation tracking',
      'Personal debt and money lent management with full repayment histories',
      'Printable financial statement reports and interactive analytics charts',
      'Zero third-party trackers and direct user data privacy',
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
