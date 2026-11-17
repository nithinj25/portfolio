import { notFound } from "next/navigation";
import PostArticle from "@/components/PostArticle";
import PostReader from "@/components/PostReader";
import { getAllPosts, getPost } from "@/lib/posts";

// Opening a post from a link inside the site lands here (an intercepted route)
// and shows it in the reader panel over the current page. Loading the URL
// directly skips this and renders src/app/blog/[slug]/page.tsx instead.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function PostPanel({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <PostReader slug={slug}>
      <PostArticle post={post} titleId="reader-title" inPanel />
    </PostReader>
  );
}
