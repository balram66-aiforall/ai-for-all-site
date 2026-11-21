import { GuideReader, guideMetadata } from '../../prototype/aws-quick-guide/reader';
import { hub } from '../../prototype/aws-quick-guide/guide';
import '../../prototype/loading/loading.css';
import '../../prototype/masthead/masthead.css';
import '../../prototype/second-brain-os/library.css';
import '../../prototype/aws-quick-guide/guide.css';

// The AWS Quick on desktop guide's hub (Balram, Nov 16). His own writing, so canonical to itself and indexable.
export const metadata = guideMetadata(hub);

export default function AwsQuickDesktopGuide() {
  return <>
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <GuideReader page={hub} />
  </>;
}
