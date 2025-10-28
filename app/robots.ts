import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/home', '/privacy', '/terms'],
        disallow: [
          '/onboarding',
          '/sign-in',
          '/sign-up',
          '/org/',
          '/settings/',
          '/billing/',
          '/api/',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://template.kosuke.ai'}/sitemap.xml`,
  };
}
