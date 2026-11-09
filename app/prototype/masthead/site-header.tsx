'use client';

/* The site's top bar: wordmark, main navigation, Contact me and the phone menu. Its own module so a page without the masthead
   (the bAI room of learning) loads only this, not the masthead's opening, sound and scene. */
import { useCallback, useEffect, useRef } from 'react';
import { roomOfLearning } from '../bairam/content';

// Back to the cave home page from another page: the hash skips the loading opening (it plays on a fresh visit, not a return).
const HOME = '/#masthead';
/* page: which page the header sits on. 'home' = a page with the masthead (its Home link is this page's own #masthead);
   'learning' = the bAI room of learning, a page of its own that links back into the cave home page;
   'work' = a page for one of his builds (Loop at /loop), so the menu marks Work, the workshop it belongs to, as where you are. */
export type SitePage = 'home' | 'learning' | 'work';
// The bio: #who on the cave pages (its own stop after the masthead) and from a page of its own, the old live home page's #about otherwise.
export const aboutHref = (base: string, page: SitePage = 'home') => (base === '' ? '#who' : page !== 'home' ? '/#who' : `${base}#about`);
// base '/' points at the home page's sections; the cave journey passes '' so the same links land on its own chambers.
// within: a page inside the room of learning (its wing and reading pages), so the menu marks the room as where you are, not this page.
type Current = 'page' | 'true' | undefined;
const navLinks = (base: string, page: SitePage, within = false): { label: string; href: string; current?: Current }[] => [
  { label: 'Home', href: page === 'home' ? '#masthead' : HOME, current: page === 'home' ? 'page' : undefined },
  { label: 'Learn', href: `${base}#learn` },
  { label: roomOfLearning.menu, href: roomOfLearning.path, current: page === 'learning' ? (within ? 'true' : 'page') : undefined },
  { label: 'Work', href: `${base}#projects`, current: page === 'work' ? 'true' : undefined },
  { label: 'About', href: aboutHref(base, page) },
];
export function Wordmark() { return <>b<span>AI</span>ram</>; }
export function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }
function Navigation({ base, page, within, close }: { base: string; page: SitePage; within?: boolean; close?: () => void }) {
  return <>{navLinks(base, page, within).map(link => <a key={link.label} href={link.href} aria-current={link.current} onClick={close}>{link.label}</a>)}</>;
}
// The phone menu (a <details>): closes on Escape (focus back on the toggle), an outside tap, focus leaving it, or a resize to desktop.
export function useMobileMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  const menuToggle = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => { if (menu.current) menu.current.open = false; }, []);
  useEffect(() => {
    const root = menu.current!;
    const mobile = matchMedia('(max-width: 760px)');
    const onResize = () => { if (!mobile.matches) root.open = false; };
    const onOutside = (event: PointerEvent) => { if (event.target instanceof Node && !root.contains(event.target)) root.open = false; };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && root.open) { root.open = false; menuToggle.current?.focus(); }
    };
    const onBlur = (event: FocusEvent) => { if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) root.open = false; };
    root.addEventListener('focusout', onBlur);
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onKey);
    mobile.addEventListener('change', onResize);
    return () => {
      root.removeEventListener('focusout', onBlur);
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onKey);
      mobile.removeEventListener('change', onResize);
    };
  }, []);
  return { menu, menuToggle, closeMenu };
}
type Menu = ReturnType<typeof useMobileMenu>;
// The top bar: wordmark, main navigation, Contact me, and the phone menu. Shared by the masthead and the room of learning.
export function Header({ base, page, within, menu: { menu, menuToggle, closeMenu } }: { base: string; page: SitePage; within?: boolean; menu: Menu }) {
  const home = page === 'home' ? '#masthead' : HOME;
  return <header className="bm-header">
    <a className="bm-brand" href={home} aria-label="bAIram home"><Wordmark /></a>
    <nav className="bm-desktop-nav" aria-label="Main navigation"><Navigation base={base} page={page} within={within} /></nav>
    <a className="bm-connect" href="https://in.linkedin.com/in/balramr66">Contact me <Arrow /></a>
    <details ref={menu} className="bm-mobile-menu">
      <summary ref={menuToggle} aria-label="Navigation menu"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg></summary>
      <nav aria-label="Mobile navigation"><Navigation base={base} page={page} within={within} close={closeMenu}/><a href="https://in.linkedin.com/in/balramr66" onClick={closeMenu}>Contact me <Arrow /></a></nav>
    </details>
  </header>;
}
// The top bar on a page without the masthead (the room of learning, Loop); skipTo = the id of that page's <main>.
export function SiteHeader({ page, skipTo, within }: { page: Exclude<SitePage, 'home'>; skipTo: string; within?: boolean }) {
  const menu = useMobileMenu();
  return <><a className="bm-skip" href={`#${skipTo}`}>Skip to content</a><Header base="/" page={page} within={within} menu={menu} /></>;
}
