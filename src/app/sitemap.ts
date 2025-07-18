import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Hanya masukkan halaman publik
  return [
    {
      url: 'https://sitrack.ydxlabs.my.id',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://sitrack.ydxlabs.my.id/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Jika Anda punya halaman publik lain (tentang kami, fitur, dll), tambahkan di sini
  ]
}