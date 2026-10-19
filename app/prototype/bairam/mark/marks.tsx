/* Round 2 (Oct 18): three bat marks for bAIram. Each is one colour (currentColor) on a 100x100 grid,
   so it can be gold on dark, dark on gold, projected as light, or laid on the floor unchanged.
   Guardrail: our own bat, never the DC emblem. No oval enclosure, no two-ear cowl head on a spread-wing bat.
   Round 1 (arch, core, crest, crown) was rejected; its SVGs are kept in the work folder. */
import type { ReactNode } from 'react';

export type MarkId = 'wing' | 'rise' | 'roost';

export type MarkSpec = {
  id: MarkId;
  no: string;
  name: string;
  idea: string;
  small: string;
  risk: string;
  recommended?: boolean;
  shapes: ReactNode;
};

export const MARKS: MarkSpec[] = [
  {
    id: 'wing',
    no: '01',
    name: 'bAI Wing',
    idea: 'A spread-wing bat. Its head and body are one gold A; the wings split into angular blades.',
    small: 'Reads as a bat in flight at 16 px.',
    risk: 'Closest to the famous emblem, so it stays out of an oval, keeps one peak instead of two ears, and splits the wings.',
    recommended: true,
    shapes: (
      <>
        <path fillRule="evenodd" d="M50 9 L59.5 55 L50 86 L40.5 55 Z M50 31 L54.4 51 H45.6 Z" />
        <g>
          <path
            fillRule="evenodd"
            d="M47 33 L22 17 L1 37 L12.5 42 L14 59 L24.5 50.5 L30.5 67 L38.5 57 L46 72 Z M22.6 21.5 L13.4 39.6 L15.4 40.4 Z M24 22.5 L24.6 46.5 L26.6 46.5 Z"
          />
        </g>
        <g transform="translate(100 0) scale(-1 1)">
          <path
            fillRule="evenodd"
            d="M47 33 L22 17 L1 37 L12.5 42 L14 59 L24.5 50.5 L30.5 67 L38.5 57 L46 72 Z M22.6 21.5 L13.4 39.6 L15.4 40.4 Z M24 22.5 L24.6 46.5 L26.6 46.5 Z"
          />
        </g>
      </>
    ),
  },
  {
    id: 'rise',
    no: '02',
    name: 'Rising Bat',
    idea: 'A bat on the up-stroke. The raised wings are the legs of an A, its arms the crossbar, its body the I.',
    small: 'A tall peak with ears in the middle; holds at 16 px.',
    risk: 'Busier inside; at 16 px the ears and arms merge into one shape.',
    shapes: (
      <>
        <path d="M48.5 6 L5 88 Q11.5 80 17 85 Q21 77 28.5 80.5 L48.5 27 Z" />
        <path d="M51.5 6 L95 88 Q88.5 80 83 85 Q79 77 71.5 80.5 L51.5 27 Z" />
        <path d="M43.5 37 L46.5 45.5 H53.5 L56.5 37 L58 50 Q58.5 61 54.5 71 L50 90 L45.5 71 Q41.5 61 42 50 Z" />
        <path d="M34 57 H66 V62 H34 Z" />
      </>
    ),
  },
  {
    id: 'roost',
    no: '03',
    name: 'Roosting Bat',
    idea: 'A bat hanging in the cave, wings wrapped. The folds of the wings draw the A.',
    small: 'A drop hanging from a line; very steady small, and it can hang from the cave cables.',
    risk: 'Calmer than the others; reads less like an emblem in flight.',
    shapes: (
      <>
        <path d="M14 7 H86 V12 H14 Z" />
        <path d="M43.5 12 H47 V22 H43.5 Z M53 12 H56.5 V22 H53 Z" />
        <path d="M47.2 21 H40 Q25 35 25 57 Q25 70 35 76.5 H37.6 Z" />
        <path d="M52.8 21 H60 Q75 35 75 57 Q75 70 65 76.5 H62.4 Z" />
        <path d="M50 25 L56.9 57.5 H43.1 Z" />
        <path d="M42.4 61 H57.6 L60.8 76.5 H39.2 Z" />
        <path fillRule="evenodd" d="M36 79 H64 L61 92 L56.5 85.5 Q50 89 43.5 85.5 L39 92 Z M45.5 80.6 A1.9 1.9 0 1 0 45.51 80.6 Z M54.5 80.6 A1.9 1.9 0 1 0 54.51 80.6 Z" />
      </>
    ),
  },
];

export function Mark({ spec, size, title, className }: { spec: MarkSpec; size?: number | string; title?: string; className?: string }) {
  return (
    <svg
      className={className ? `bk-mark ${className}` : 'bk-mark'}
      data-mark={spec.id}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {spec.shapes}
    </svg>
  );
}
