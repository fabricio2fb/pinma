import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/login', '/groups', '/map', '/profile', '/settings'],
    },
    sitemap: 'https://www.alertloc.online/sitemap.xml',
  };
}
