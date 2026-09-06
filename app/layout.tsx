import type { Metadata } from 'next';
import Script from 'next/script';
import { AifaAssistantLoader } from './components/AifaAssistantLoader';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI For All | Learn AI simply',
  description:
    'AI For All is Balram’s public platform for simple AI learning, role guides, practical workflows, community examples, and site-building help.',
  openGraph: {
    title: 'AI For All | Learn AI simply',
    description:
      'AI For All is Balram’s public platform for simple AI learning, role guides, practical workflows, community examples, and site-building help.',
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
