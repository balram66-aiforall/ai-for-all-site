import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI For All | Practical AI for real work',
  description:
    'AI For All is Balram’s public notebook for accessible AI, tested workflows, practical training, and the best ideas worth sharing.',
  openGraph: {
    title: 'AI For All | Practical AI for real work',
    description:
      'AI For All is Balram’s public notebook for accessible AI, tested workflows, practical training, and the best ideas worth sharing.',
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
