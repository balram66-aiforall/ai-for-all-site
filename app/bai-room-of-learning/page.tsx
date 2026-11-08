import type { Metadata } from 'next';
import { RoomOfLearning } from '../prototype/room-of-learning/room';
import { roomOfLearning } from '../prototype/bairam/content';
import '../prototype/loading/loading.css';
import '../prototype/masthead/masthead.css';
import '../prototype/bairam/journey.css';
import '../prototype/room-of-learning/room.css';

export const metadata: Metadata = {
  title: `${roomOfLearning.name} | bAIram | Balram R.`,
  description: roomOfLearning.intro,
  alternates: { canonical: roomOfLearning.path },
  robots: { index: true, follow: true },
  openGraph: { title: `${roomOfLearning.name} | bAIram | Balram R.`, description: roomOfLearning.intro, url: roomOfLearning.path, type: 'website',
    images: [{ url: '/assets/room-of-learning/classroom-1600.webp', width: 1600, height: 914, alt: 'A classroom carved into the bAIram cave' }] },
};

export default function RoomOfLearningPage() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <RoomOfLearning />
  </>;
}
