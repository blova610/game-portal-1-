import Head from "next/head"
import { type SeoProps, DEFAULT_SEO } from "@/lib/seo"

export default function SeoHead({ title, description, image, url, type, robots, keywords, jsonLd }: SeoProps) {
  const seo = {
    title: title || DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
    type: type || DEFAULT_SEO.type,
    robots: robots || DEFAULT_SEO.robots,
    keywords: keywords || DEFAULT_SEO.keywords,
  }

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={seo.type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Canonical */}
      <link rel="canonical" href={seo.url} />

      {/* JSON-LD */}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </Head>
  )
}
