import type { Metadata } from 'next';
import { LoadingOpening } from './opening';
import './loading.css';

export const metadata: Metadata = {
  title: 'Balram → bAIram | Opening preview',
  description: 'An isolated, local loading-screen study.',
  robots: { index: false, follow: false },
};

export default function LoadingPreview() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <LoadingOpening />
  </>;
}
