import type {BlogPost} from "@app/configs/blogs.config.ts";

/**
 * Builds sharing data from the authored catalog rather than the current browser URL.
 * Referral queries and section hashes therefore never become part of a copied reference.
 */
export const getBlogShareData = (post: BlogPost) => {
  const url = `https://www.ayu-sh-kr.com/blog/${encodeURIComponent(post.slug)}/`;
  const reference = `${post.writer}. “${post.header}” (${post.date}). ${url}`;
  return {
    title: post.header,
    url,
    reference,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${post.header}\n${url}`)}`,
  };
};
