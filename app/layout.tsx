import type { Metadata } from 'next';
import Script from 'next/script';
import { AifaAssistantLoader } from './components/AifaAssistantLoader';
import './globals.css';
import './platform.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://balramr.in'),
  title: 'Balram | AI For All',
  description:
    'Learn practical AI with Balram, an AI lead, educator, and builder. Explore role-based workflows, hands-on lessons, projects, and training through AI For All.',
  openGraph: {
    title: 'Balram | AI For All',
    description:
      'AI For All is Balram’s public platform for simple AI learning, role guides, practical workflows, community examples, and site-building help.',
    type: 'website',
    images: [{ url: '/assets/aifa-teammate-charcoal-hero.webp', width: 1600, height: 900, alt: 'AI For All: human judgment and AI execution' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = window.localStorage.getItem('aifa-theme');
              const theme = stored === 'dark' ? 'dark' : 'light';
              document.documentElement.dataset.theme = theme;
              document.documentElement.dataset.themePhase = 'idle';
            } catch (error) {}
          })();`}
        </Script>
      </head>
      <body>
        {children}
        <AifaAssistantLoader />
      </body>
    </html>
  );
}
