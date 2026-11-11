// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAiImages from './src/lib/rehypeAiImages.mjs';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://wilinski.me',
  integrations: [sitemap({
    // The QR landing page is meant for people who scan the code, not for search results
    filter: (page) => !page.includes('/card'),
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en',
        de: 'de',
      },
    },
  })],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeAiImages],
    }),
  },
  security: {
    // Emits a hash-based Content-Security-Policy <meta> tag on every page
    csp: {
      scriptDirective: {
        resources: ["'self'", 'https://analytics.reforgelabs.com'],
      },
      styleDirective: {
        // KaTeX, Shiki and a few components rely on inline style attributes
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        // Vite inlines small font files (KaTeX) as data: URIs
        "font-src 'self' data:",
        "connect-src 'self' https://analytics.reforgelabs.com",
        // Videos on /hobbies/ play from YouTube's no-cookie domain, only after a click
        "frame-src https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: true
    }
  }
});
