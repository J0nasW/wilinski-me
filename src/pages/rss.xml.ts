import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const englishPosts = posts
    .filter((post) => {
      const pathParts = post.id.split('/');
      return pathParts.length > 1 && pathParts[0] === 'en';
    })
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Jonas Wilinski — Blog',
    description: 'Writing about AI, software development, doing a PhD and the occasional personal reflection.',
    site: context.site!.toString(),
    items: englishPosts.map((post) => {
      const slug = post.id.split('/').slice(1).join('/').replace(/\.md$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/en/blog/${slug}/`,
      };
    }),
  });
}
