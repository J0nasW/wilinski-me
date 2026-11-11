import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postSlug } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = (await getPosts('en')).filter((post) => post.id.startsWith('en/') && !post.data.draft);

  return rss({
    title: 'Jonas Wilinski — Blog',
    description: 'Writing about AI, software development, doing a PhD and the occasional personal reflection.',
    site: context.site!.toString(),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/en/blog/${postSlug(post.id)}/`,
    })),
  });
}
