import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuideReader, guideMetadata } from '../../../prototype/aws-quick-guide/reader';
import { chapterPage, pages } from '../../../prototype/aws-quick-guide/guide';
import '../../../prototype/loading/loading.css';
import '../../../prototype/masthead/masthead.css';
import '../../../prototype/second-brain-os/library.css';
import '../../../prototype/aws-quick-guide/guide.css';

type Props = { params: Promise<{ chapter: string }> };

// Only chapters that have been written get a page; the rest are "Coming soon" in the rail and answer 404 until then.
export function generateStaticParams() {
  return pages.filter(p => p.chapter > 0).map(p => ({ chapter: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = chapterPage((await params).chapter);
  return page ? guideMetadata(page) : { title: 'Not found | AWS Quick on desktop', robots: { index: false } };
}

export default async function AwsQuickDesktopChapter({ params }: Props) {
  const page = chapterPage((await params).chapter);
  if (!page) notFound();
  return <>
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <GuideReader page={page} />
  </>;
}
