import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Reader } from '../../../prototype/second-brain-os/reader';
import { allSlugs, pageAt } from '../../../prototype/second-brain-os/library';
import '../../../prototype/loading/loading.css';
import '../../../prototype/masthead/masthead.css';
import '../../../prototype/second-brain-os/library.css';

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return allSlugs().map(slug => ({ slug }));
}

// Each page points search engines at its original file on GitHub (the author's site addresses pages by #hash, which
// search engines read as one page), so this copy never competes with the source.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = pageAt((await params).slug);
  if (!page) return { title: 'Not found | Second Brain OS' };
  const title = `${page.title} | Second Brain OS | bAI room of learning`;
  return { title, description: page.summary, alternates: { canonical: page.github }, robots: { index: true, follow: true },
    openGraph: { title, description: page.summary, url: page.url, type: 'article' } };
}

export default async function SecondBrainOsReadingPage({ params }: Props) {
  const page = pageAt((await params).slug);
  if (!page) notFound();
  return <>
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Reader page={page} />
  </>;
}
