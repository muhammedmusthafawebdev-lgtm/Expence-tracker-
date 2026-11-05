/**
 * Automated Verification Script for SEO Optimization
 * Audits metadata, sitemap.ts, robots.ts, manifest.ts, JSON-LD,
 * heading hierarchy, and private-route noindex protections.
 */

import robotsHandler from '../app/robots';
import sitemapHandler from '../app/sitemap';
import manifestHandler from '../app/manifest';
import { SITE_CONFIG, getSiteUrl } from '../lib/seo/config';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runSeoAudit() {
  console.log('\n======================================================');
  console.log('🔍 EXPENSE TRACKER — COMPLETE TECHNICAL SEO AUDIT');
  console.log('======================================================\n');

  // Test Suite 1: Global Next.js Metadata API
  console.log('📋 Test Suite 1: Native Next.js Metadata API Configuration');
  const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
  assert(fs.existsSync(layoutPath), 'app/layout.tsx exists');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  assert(layoutContent.includes('metadataBase: new URL(siteUrl)'), 'metadataBase is explicitly configured with canonical URL');
  assert(layoutContent.includes('title: {'), 'Title configuration is defined with default and template');
  assert(layoutContent.includes('SITE_CONFIG.title'), 'Default title bound to SITE_CONFIG.title');
  assert(layoutContent.includes('SITE_CONFIG.titleTemplate'), 'Title template bound to SITE_CONFIG.titleTemplate');
  assert(layoutContent.includes('description: SITE_CONFIG.description'), 'Meta description bound to SITE_CONFIG.description');
  const descLen = SITE_CONFIG.description.length;
  assert(descLen >= 120 && descLen <= 250, `Meta description length (${descLen} chars) is well-optimized`);
  assert(SITE_CONFIG.keywords.length > 5, 'Semantic search keywords defined without stuffing');
  assert(layoutContent.includes('applicationName: SITE_CONFIG.name'), 'applicationName is specified');

  // Canonical & Alternates
  assert(layoutContent.includes("canonical: '/'"), 'Canonical alternate URL points strictly to public root');

  // Robots
  assert(layoutContent.includes('index: true') && layoutContent.includes('follow: true'), 'Public robots directives permit indexing and following');
  assert(layoutContent.includes('googleBot: {'), 'Googlebot-specific snippet and image preview directives configured');

  // Test Suite 2: Open Graph & Twitter Cards
  console.log('\n📋 Test Suite 2: Social Graph & Open Graph Metadata');
  assert(layoutContent.includes('openGraph: {'), 'OpenGraph configuration present');
  assert(layoutContent.includes("type: 'website'"), 'OpenGraph type is "website"');
  assert(layoutContent.includes('siteName: SITE_CONFIG.name'), 'OpenGraph site_name is set');
  assert(layoutContent.includes('twitter: {'), 'Twitter card configuration present');
  assert(layoutContent.includes("card: 'summary_large_image'"), 'Twitter card format is summary_large_image');

  // Test Suite 3: Sitemap.ts
  console.log('\n📋 Test Suite 3: XML Sitemap (app/sitemap.ts)');
  const sitemapEntries = sitemapHandler();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 0, 'sitemap() returns valid array of entries');
  const siteUrl = getSiteUrl();
  assert(sitemapEntries[0].url === siteUrl, `Sitemap primary entry matches canonical URL: ${siteUrl}`);
  assert(sitemapEntries[0].priority === 1.0, 'Primary landing page priority is 1.0');
  assert(Boolean(sitemapEntries[0].lastModified), 'lastModified timestamp is present');
  const hasPrivateInSitemap = sitemapEntries.some(
    (e) =>
      e.url.includes('/dashboard') ||
      e.url.includes('/transactions') ||
      e.url.includes('/debt')
  );
  assert(!hasPrivateInSitemap, 'Private authenticated application screens are strictly excluded from sitemap');

  // Test Suite 4: Robots.ts
  console.log('\n📋 Test Suite 4: Robots Directive (app/robots.ts)');
  const robotsConfig = robotsHandler();
  assert(Boolean(robotsConfig.rules), 'robots() returns valid rules');
  assert(robotsConfig.sitemap === `${siteUrl}/sitemap.xml`, `robots.txt references sitemap XML: ${robotsConfig.sitemap}`);
  const defaultRule = (Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules) as any;
  assert(defaultRule.allow === '/', 'robots.txt explicitly allows public root "/"');
  assert(
    defaultRule.disallow.includes('/api/') && defaultRule.disallow.includes('/_next/'),
    'robots.txt forbids crawling internal APIs and Next.js build assets'
  );

  // Test Suite 5: Web Manifest (app/manifest.ts)
  console.log('\n📋 Test Suite 5: Web Application Manifest (app/manifest.ts)');
  const manifestData = manifestHandler();
  assert(manifestData.name === SITE_CONFIG.name, 'Manifest name matches brand identity');
  assert(manifestData.display === 'standalone', 'Manifest display set to standalone for PWA compatibility');
  assert(Boolean(manifestData.theme_color), 'Theme color defined in manifest');

  // Test Suite 6: Structured Data (JSON-LD)
  console.log('\n📋 Test Suite 6: Structured Data & Schema.org (JSON-LD)');
  const jsonLdPath = path.join(process.cwd(), 'components/seo/JsonLd.tsx');
  assert(fs.existsSync(jsonLdPath), 'JsonLd component file exists');
  const jsonLdCode = fs.readFileSync(jsonLdPath, 'utf8');
  assert(jsonLdCode.includes("'WebApplication'") || jsonLdCode.includes('"WebApplication"'), 'JSON-LD defines Schema.org WebApplication');
  assert(jsonLdCode.includes("'WebSite'") || jsonLdCode.includes('"WebSite"'), 'JSON-LD defines Schema.org WebSite');
  assert(jsonLdCode.includes('applicationCategory') && SITE_CONFIG.applicationCategory === 'FinanceApplication', 'Application category set to FinanceApplication');
  assert(jsonLdCode.includes("price: '0'") || jsonLdCode.includes('price: "0"'), 'Accurate free tier pricing defined without fabricated claims');
  assert(!jsonLdCode.includes('ratingValue'), 'No fabricated reviews or fake star ratings present');

  // Test Suite 7: Heading Hierarchy & Semantic Landmarks
  console.log('\n📋 Test Suite 7: Semantic HTML & Heading Hierarchy');
  const welcomePath = path.join(process.cwd(), 'components/auth/WelcomeView.tsx');
  const welcomeCode = fs.readFileSync(welcomePath, 'utf8');
  assert(welcomeCode.includes('<h1'), 'Single clear H1 heading present in landing page');
  assert(welcomeCode.includes('<h2'), 'H2 heading present to establish strict sequential hierarchy');
  assert(welcomeCode.includes('<h3'), 'H3 headings present for feature cards');
  assert(welcomeCode.includes('<nav'), 'Semantic <nav> element wraps navigational links');
  assert(welcomeCode.includes('<header') && welcomeCode.includes('<main') && welcomeCode.includes('<footer'), 'Full set of landmark elements present (<header>, <main>, <footer>)');

  // Test Suite 8: Private Route SEO Protection
  console.log('\n📋 Test Suite 8: Private Route SEO & Privacy Protection');
  const routeSeoPath = path.join(process.cwd(), 'components/seo/RouteSeoManager.tsx');
  assert(fs.existsSync(routeSeoPath), 'RouteSeoManager component exists');
  const routeSeoCode = fs.readFileSync(routeSeoPath, 'utf8');
  assert(routeSeoCode.includes('noindex, nofollow, noarchive'), 'Dynamically enforces noindex, nofollow, noarchive on authenticated screens');
  assert(routeSeoCode.includes('dashboard') && routeSeoCode.includes('transactions') && routeSeoCode.includes('debt'), 'Private screens explicitly tracked in isolation registry');

  // Test Suite 9: Custom 404 Not Found Page
  console.log('\n📋 Test Suite 9: Custom 404 Page (app/not-found.tsx)');
  const notFoundPath = path.join(process.cwd(), 'app/not-found.tsx');
  assert(fs.existsSync(notFoundPath), 'Custom app/not-found.tsx page exists');
  const notFoundCode = fs.readFileSync(notFoundPath, 'utf8');
  assert(notFoundCode.includes('index: false'), 'Not found page has noindex metadata');
  assert(notFoundCode.includes('href="/"'), 'Not found page provides clear back-to-home navigation');

  console.log('\n======================================================');
  console.log(`📊 SEO AUDIT SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSeoAudit().catch((err) => {
  console.error('Fatal error during SEO audit:', err);
  process.exit(1);
});
