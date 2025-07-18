import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/', 
      disallow: '/dashboard/', 
    },
    sitemap: 'https://sitrack.ydxlabs.my.id/sitemap.xml', 
  }
}