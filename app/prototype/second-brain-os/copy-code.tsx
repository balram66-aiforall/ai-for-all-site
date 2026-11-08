'use client';

/* Copy buttons on the code blocks. The buttons are plain markup in the synced HTML; this marks the article ready (CSS shows
   them only then, so without JavaScript there are no dead buttons) and copies the block's text on click. */
import { useEffect, useRef, useState } from 'react';

export function CopyCode() {
  const marker = useRef<HTMLSpanElement>(null);
  const [said, setSaid] = useState('');
  useEffect(() => {
    const article = marker.current?.closest<HTMLElement>('.sb-article');
    if (!article) return;
    article.dataset.copy = 'ready';
    const timers = new Map<HTMLButtonElement, number>();
    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>('.sb-copy');
      if (!button || !article.contains(button)) return;
      const code = button.closest('.sb-code')?.querySelector('code')?.textContent ?? '';
      try { await navigator.clipboard.writeText(code); } catch { return; }
      button.textContent = 'Copied';
      setSaid('Copied');
      clearTimeout(timers.get(button));
      timers.set(button, window.setTimeout(() => { button.textContent = 'Copy'; setSaid(''); }, 1600));
    };
    article.addEventListener('click', onClick);
    return () => { article.removeEventListener('click', onClick); timers.forEach(t => clearTimeout(t)); };
  }, []);
  return <span ref={marker} className="sb-sr" role="status" aria-live="polite">{said}</span>;
}
