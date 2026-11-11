/* The proving wall's credentials. One entry per plate, shown in this order.
   Copy every field exactly as printed on the credential. Never upgrade the wording: a training completion
   says "Completion certificate", never "Certified".
   `sample: true` marks a placeholder: it renders with a visible "Sample" tag, and tests/release-guard.mjs
   fails while any sample remains, so a dummy credential can never ship.
   `url` = the public verification page, only when one exists (Credly: /badges/<id>/public_url, never the /go/ or /earner/ link). Badges are the issuer's file, shown unaltered.
   "Certified" appears only where it is the credential's own name (Gemini Certified Faculty). */
export type Cert = {
  name: string;
  issuer: string;
  year: string;
  kind?: string;
  /** Full completion date, only when the credential itself prints it. Shown as "Completed <date>". */
  date?: string;
  /** Month and year as LinkedIn lists it ("Sep 2026"), used when no full date is printed. Shown as "Issued <issued>". */
  issued?: string;
  credentialId?: string;
  url?: string;
  /** Who hosts the verification page, when it isn't the issuer (e.g. Credly). */
  verifiedBy?: string;
  badge?: { src: string; alt: string };
  /** The certificate itself, from the issuer's own file: resized only, and trimmed only outside the certificate's
   *  border (print headers, page margins). Built by frontier-aimplify/work/builder/2026-10-19-proving-wall-photos/source/make_photos.py. */
  photo?: { src: string; width: number; height: number; /** 'badge' when the credential has no certificate and the photo is its badge. */ of?: 'badge' };
  sample?: boolean;
};

export const certs: Cert[] = [
  // Nov 11 2026, Balram: "Add all 12", from his Google for Education Accredible wallet (edu.google.accredible.com/profile/
  // balramr142937/wallet) and his AWS Skill Builder profile (skillsprofile.skillbuilder.aws/user/balramr). Each checked that
  // day on the issuer's own record: Accredible's credential API (verified, not revoked, not expired, recipient Balram R /
  // "balram R") and Credly's Open Badges assertion (issuer 'Amazon Web Services Training and Certification', issuedOn as
  // below; the public page names Balram R.). Names are the credential's own; on Credly the " - Training Badge" suffix
  // becomes the kind. A kind only where the credential prints one: the Google badges print their tier. Where there is no
  // certificate, the plate shows the badge in the photo slot (of: 'badge'). Images: frontier-aimplify/work/builder/
  // 2026-11-11-proving-wall-nov-certs/source/make_assets.py.
  // Accredible: issued 2026-11-09, valid through 2029-11-09. Photo = Accredible's render of his certificate.
  { name: 'Gemini Certified Faculty', issuer: 'Google for Education', year: '2026', date: 'November 9, 2026',
    url: 'https://edu.google.accredible.com/8b4d5d3a-0a6f-4f88-b4d7-aed83acc61c6', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-gemini-certified-faculty', width: 560, height: 433 } },
  // Accredible (OpenAI Academy's own wallet, oaiacademy.credential.net): issued 2026-11-09, expires 2027-05-09. Badge only.
  { name: 'AI Leadership', issuer: 'OpenAI Academy', year: '2026', date: 'November 9, 2026',
    url: 'https://oaiacademy.credential.net/66ceab2e-a8f6-46e8-a60a-0c16329f74a5', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/openai-ai-leadership', width: 560, height: 560, of: 'badge' } },
  // Credly: 'AWS Partner: Generative AI Technical - Training Badge', issuedOn 2026-11-03.
  { name: 'AWS Partner: Generative AI Technical', issuer: 'Amazon Web Services Training and Certification', year: '2026',
    kind: 'Training Badge', date: 'November 3, 2026',
    url: 'https://www.credly.com/badges/9589e7bb-876a-44d9-830f-afaa0dbe5586/public_url', verifiedBy: 'Credly',
    photo: { src: '/assets/proving-wall/certs/aws-generative-ai-technical', width: 560, height: 560, of: 'badge' } },
  // Accredible: issued 2026-11-01. The certificate prints "certificate of attendance for completing 3 hours" and his name
  // as "balram R" (shown as printed). Photo = Accredible's render of his certificate.
  { name: 'Google AI Educator Series for India in English', issuer: 'Google for Education', year: '2026',
    kind: 'Certificate of attendance', date: 'November 1, 2026',
    url: 'https://edu.google.accredible.com/8754d75a-2a49-4fa7-95ab-abcae839fca4', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-ai-educator-series-india', width: 560, height: 433 } },
  // The series' module badges, Accredible, issued 2026-11-01 (four) and 2026-10-31 (two). Kind = the tier printed on each.
  { name: 'Set up Your Digital Workspace', issuer: 'Google for Education', year: '2026', kind: 'Foundational', date: 'November 1, 2026',
    url: 'https://edu.google.accredible.com/3a3a96a9-7696-48e1-805c-bd31a3391436', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-set-up-your-digital-workspace', width: 560, height: 560, of: 'badge' } },
  { name: 'Get to Know Gemini for Education', issuer: 'Google for Education', year: '2026', kind: 'Foundational', date: 'November 1, 2026',
    url: 'https://edu.google.accredible.com/31a877c8-47ad-421a-8b64-1652f9590c05', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-get-to-know-gemini-for-education', width: 560, height: 517, of: 'badge' } },
  { name: 'Create Lesson Plans and Supporting Materials Using Gemini', issuer: 'Google for Education', year: '2026', kind: 'Pedagogical', date: 'November 1, 2026',
    url: 'https://edu.google.accredible.com/3c1cb1ad-ef46-47ed-9b94-f84f3c566ee6', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-create-lesson-plans-using-gemini', width: 560, height: 560, of: 'badge' } },
  { name: 'Build Your Portfolios Through Vibe Coding in Gemini Canvas', issuer: 'Google for Education', year: '2026', kind: 'Administrative', date: 'November 1, 2026',
    url: 'https://edu.google.accredible.com/4c65dda8-5344-4574-8978-4f3761fa531c', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-vibe-coding-in-gemini-canvas', width: 560, height: 560, of: 'badge' } },
  { name: 'Basics of AI', issuer: 'Google for Education', year: '2026', kind: 'Foundational', date: 'October 31, 2026',
    url: 'https://edu.google.accredible.com/4f796580-12b2-4682-bb49-31998297c148', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-basics-of-ai', width: 560, height: 560, of: 'badge' } },
  { name: 'Your AI-Powered Private Research and Thinking Partner: Gemini Notebook', issuer: 'Google for Education', year: '2026', kind: 'Foundational', date: 'October 31, 2026',
    url: 'https://edu.google.accredible.com/6dfdddb1-1f9b-4e55-a666-acfe63cc54b0', verifiedBy: 'Accredible',
    photo: { src: '/assets/proving-wall/certs/google-gemini-notebook', width: 560, height: 517, of: 'badge' } },
  // Credly: 'AWS Knowledge: AI Driven Development Lifecycle Foundations – Training Badge', issuedOn 2026-10-26 (10:56Z).
  { name: 'AWS Knowledge: AI Driven Development Lifecycle Foundations', issuer: 'Amazon Web Services Training and Certification', year: '2026',
    kind: 'Training Badge', date: 'October 26, 2026',
    url: 'https://www.credly.com/badges/524ce136-b4f8-4ae6-9793-b81182a6a610/public_url', verifiedBy: 'Credly',
    photo: { src: '/assets/proving-wall/certs/aws-ai-driven-development-lifecycle', width: 560, height: 560, of: 'badge' } },
  // Credly: 'AWS Partner: Kiro Learning Plan Assessment - Training Badge', issuedOn 2026-10-26 (07:06Z). The badge art reads
  // "Kiro Technical"; the plate uses the credential's name.
  { name: 'AWS Partner: Kiro Learning Plan Assessment', issuer: 'Amazon Web Services Training and Certification', year: '2026',
    kind: 'Training Badge', date: 'October 26, 2026',
    url: 'https://www.credly.com/badges/cf77125d-bacb-479e-9e18-1b5547155ec7/public_url', verifiedBy: 'Credly',
    photo: { src: '/assets/proving-wall/certs/aws-kiro-learning-plan-assessment', width: 560, height: 560, of: 'badge' } },
  {
    // Source: Balram's AWS Training & Certification completion certificate PDF and badge PNG, shared Oct 17 2026.
    name: 'AWS Partner: Amazon Quick Technical Foundations',
    issuer: 'AWS Training & Certification',
    year: '2026',
    kind: 'Completion certificate',
    date: 'October 14, 2026',
    // Verified Oct 17 against Credly's Open Badges assertion: badge 'AWS Partner: Amazon Quick Technical', issuer
    // 'Amazon Web Services Training and Certification', issuedOn 2026-10-14, not expired or revoked.
    url: 'https://www.credly.com/badges/3195522d-80ce-4f35-a730-719466a7170f/public_url',
    verifiedBy: 'Credly',
    badge: { src: '/assets/proving-wall/badges/aws-amazon-quick-technical-trained', alt: 'AWS Amazon Quick Technical Trained Partner badge' },
    photo: { src: '/assets/proving-wall/certs/aws-amazon-quick-technical-foundations', width: 560, height: 433 },
  },
  // The Oct 19 plates (then 2 to 13): Balram's LinkedIn Licenses & certifications list, newest first, read Oct 19 2026 (approved: "go with ur
  // recommendtion"). Name: the certificate's own wording where its image is legible, otherwise LinkedIn's exactly. Issuer:
  // exactly as LinkedIn lists it. A type (kind) only where the credential states one. Verify only where the page was checked.
  // Left out: Foundations of Digital Marketing and E-commerce (Google, Jan 2024), the one non-AI entry; and (Balram, Oct 19:
  // "Certificates without photos, remove them") "Gen AI Agents: Transform Your Organization" (Jun 2026) and
  // "Introduction to Vertex AI Studio" (Mar 2026), both Google Cloud Skills Boost.
  // Credly link from Balram (Oct 19). Verified via Credly's Open Badges assertion: badge 'AWS Partner: Amazon Quick Essentials',
  // issuer 'Amazon Web Services Training and Certification', issuedOn 2026-09-29, not expired or revoked; public page names Balram R.
  {
    // Completion certificate PDF from Balram (Downloads/b6991d21-....pdf, Oct 19): "Completed: September 29, 2026", awarded to R, Balram.
    name: 'AWS Partner: Amazon Quick Essentials', issuer: 'Amazon Web Services (AWS)', year: '2026',
    kind: 'Completion certificate', date: 'September 29, 2026',
    photo: { src: '/assets/proving-wall/certs/aws-amazon-quick-essentials', width: 560, height: 433 },
    url: 'https://www.credly.com/badges/c9b54384-ac96-4df1-b919-980094cc87d2/public_url', verifiedBy: 'Credly',
    badge: { src: '/assets/proving-wall/badges/aws-amazon-quick-essentials-trained', alt: 'AWS Amazon Quick Essentials Trained Partner badge' },
  },
  // MLU Certificate of Completion PDF (Downloads/balramr_certificate_182634.pdf, Oct 19): name and date as printed.
  { name: 'Agentic AI: Essential Concepts for Builders', issuer: 'Amazon', year: '2026', kind: 'Certificate of Completion', date: 'August 10, 2026',
    photo: { src: '/assets/proving-wall/certs/mlu-agentic-ai-essential-concepts', width: 560, height: 384 } },
  // MLU Certificate of Completion PDF (Downloads/balramr_certificate_161178.pdf, Oct 19): name and date as printed.
  { name: 'Advanced Prompt Engineering for LLMs', issuer: 'Machine Learning University Amazon', year: '2026', kind: 'Certificate of Completion', date: 'May 16, 2026',
    photo: { src: '/assets/proving-wall/certs/mlu-advanced-prompt-engineering', width: 560, height: 384 } },
  // MLU Certificate of Completion PDF (Downloads/balramr_certificate_146311.pdf, Oct 19): name and date as printed. LinkedIn: "Multi Agent".
  { name: 'Agentic AI: Multi-Agent Collaboration', issuer: 'Amazon Machine Learning University', year: '2026', kind: 'Certificate of Completion', date: 'April 30, 2026',
    photo: { src: '/assets/proving-wall/certs/mlu-agentic-ai-multi-agent-collaboration', width: 560, height: 384 } },
  // Google Cloud skill badge image from Balram (Oct 19): title and "Skill Badge · Introductory" as printed. LinkedIn: "Create your first ...".
  { name: 'Create Your First Gemini Enterprise Application', issuer: 'Google Cloud Security', year: '2026', kind: 'Skill Badge · Introductory', issued: 'Apr 2026',
    photo: { src: '/assets/proving-wall/certs/google-gemini-enterprise-application', width: 560, height: 374 } },
  // Certificate wording (LinkedIn: "AI Fundamentals Machine Learning University").
  // MLU Certificate of Completion PDF (Downloads/balramr_certificate_128079.pdf, Oct 19): name and date as printed.
  { name: 'AI Fundamentals', issuer: 'Amazon Web Services (AWS)', year: '2026', kind: 'Certificate of Completion', date: 'April 06, 2026',
    photo: { src: '/assets/proving-wall/certs/mlu-ai-fundamentals', width: 560, height: 384 } },
  // Anthropic certificates of completion, images from Balram (Oct 19); he sent them to add, so the printed name "Balram gowda" is
  // approved to show. Titles as printed (LinkedIn: "AI Fluency for Educators", "Teaching AI Fluency"). No date printed: LinkedIn's.
  { name: 'AI Fluency for educators', issuer: 'Anthropic', year: '2026', kind: 'Certificate of Completion', issued: 'Mar 2026',
    photo: { src: '/assets/proving-wall/certs/anthropic-ai-fluency-for-educators', width: 560, height: 424 } },
  { name: 'Teaching the AI Fluency Framework', issuer: 'Anthropic', year: '2026', kind: 'Certificate of Completion', issued: 'Mar 2026',
    photo: { src: '/assets/proving-wall/certs/anthropic-teaching-the-ai-fluency-framework', width: 560, height: 424 } },
  // Certificate wording (LinkedIn: "AI fluency: framework and foundation"). Skilljar page 9q5zzt2snwpg checked Oct 19 and
  // matches, but prints the student as "Baltam gowda", so no Verify link until Balram decides.
  { name: 'AI Fluency: Framework & Foundations', issuer: 'Anthropic', year: '2026', kind: 'Certificate of Completion', issued: 'Mar 2026',
    photo: { src: '/assets/proving-wall/certs/anthropic-ai-fluency-framework-foundations', width: 560, height: 424 } },
  // Coursera verify pages checked Oct 19: "Course Certificate", completed by Balram R on the date shown.
  {
    name: 'Copywriting with ChatGPT: Produce Compelling Copy That Sells', issuer: 'Coursera Project Network', year: '2024',
    kind: 'Course Certificate', date: 'February 4, 2024', credentialId: '2ZAYC58DQWS4',
    url: 'https://www.coursera.org/account/accomplishments/verify/2ZAYC58DQWS4', verifiedBy: 'Coursera',
    photo: { src: '/assets/proving-wall/certs/coursera-copywriting-with-chatgpt', width: 560, height: 431 },
  },
  {
    name: 'Prompt Engineering Generative AI for Marketing & Advertising', issuer: 'Coursera Project Network', year: '2024',
    kind: 'Course Certificate', date: 'January 1, 2024', credentialId: 'FDPR86T4RJCW',
    url: 'https://www.coursera.org/account/accomplishments/verify/FDPR86T4RJCW', verifiedBy: 'Coursera',
    photo: { src: '/assets/proving-wall/certs/coursera-prompt-engineering-marketing', width: 560, height: 431 },
  },
  // Coursera's page for this ID shows only "Course Record" with no certificate on it, so no Verify link. The photo is
  // Coursera's own public certificate image for the same ID.
  {
    name: 'Marketing with Generative AI: Create Images & Videos', issuer: 'Coursera Project Network', year: '2024', issued: 'Jan 2024', credentialId: 'ZBLZ8YSBYNU2',
    photo: { src: '/assets/proving-wall/certs/coursera-marketing-with-generative-ai', width: 560, height: 431 },
  },
];
