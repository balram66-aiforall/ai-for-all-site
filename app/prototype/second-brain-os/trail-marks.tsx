'use client';

/* On a reading page: remembers it as the last page opened, marks it read once the visitor reaches its end (the Previous and
   Next links come into view), and lights every link to a read page (the rail, Connected pages). Hovering or focusing a
   connected page lights its point on the small map. Renders nothing. */
import { useEffect } from 'react';
import { markRead, setLastPage, watchTrail } from './trail';

export function TrailMarks({ url }: { url: string }) {
  useEffect(() => {
    setLastPage(url);
    const stop = watchTrail(read => {
      for (const el of document.querySelectorAll<HTMLElement | SVGElement>('[data-sb-url]')) {
        if (read.has(el.dataset.sbUrl ?? '')) el.dataset.read = ''; else delete el.dataset.read;
      }
    });
    const end = document.querySelector('.sb-turn');
    const io = end && new IntersectionObserver(([e]) => { if (e.isIntersecting) { markRead(url); io?.disconnect(); } });
    if (end && io) io.observe(end);
    const near = document.querySelector('.sb-near');
    const light = (e: Event) => {
      const k = (e.target as Element | null)?.closest<HTMLElement>('[data-near]')?.dataset.near;
      near?.querySelectorAll('[data-near-dot]').forEach(d => d.classList.toggle('is-hot', d.getAttribute('data-near-dot') === k));
    };
    const off = () => near?.querySelectorAll('[data-near-dot].is-hot').forEach(d => d.classList.remove('is-hot'));
    near?.addEventListener('pointerover', light); near?.addEventListener('focusin', light);
    near?.addEventListener('pointerleave', off); near?.addEventListener('focusout', off);
    return () => {
      stop(); io?.disconnect();
      near?.removeEventListener('pointerover', light); near?.removeEventListener('focusin', light);
      near?.removeEventListener('pointerleave', off); near?.removeEventListener('focusout', off);
    };
  }, [url]);
  return null;
}
