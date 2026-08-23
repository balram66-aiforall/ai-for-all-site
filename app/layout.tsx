import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI For All | Balram\'s AI Teammate Portfolio',
  description:
    'A living portfolio for AI teammate thinking, LinkedIn articles, useful workflows, and practical AI tips.',
  openGraph: {
    title: 'AI For All | Balram\'s AI Teammate Portfolio',
    description:
      'A living portfolio for AI teammate thinking, LinkedIn articles, useful workflows, and practical AI tips.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
