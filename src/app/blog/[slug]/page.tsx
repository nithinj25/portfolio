import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostArticle from "@/components/PostArticle";
import { ArrowLeft } from "@/components/icons";
import { site } from "@/data/site";
import { getAllPosts, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // "Reading room": the backdrop goes still on post pages (see WorldBackdrop),
  // and this bar replaces the busy home-page context.
  return (
    <div className="mx-auto max-w-[760px] pt-10">
      <div className="rise flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm">
        <Link href="/" className="inline-flex items-center gap-2 py-2 text-muted transition-colors hover:text-fg">
          <ArrowLeft width={14} height={14} /> Back to {site.name}
        </Link>
        <Link href="/blog" className="py-2 font-mono text-xs uppercase tracking-widest text-faint transition-colors hover:text-fg">
          All posts
        </Link>
      </div>
      <div className="rise mt-10" style={{ "--i": 1 } as React.CSSProperties}>
        <PostArticle post={post} />
      </div>
    </div>
  );
}
