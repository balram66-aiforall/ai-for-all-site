"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeShell } from "../components/ThemeShell";
import { Copy } from "lucide-react";
type Lang = "en";
type SectionId = "hero" | "school" | "rewriter" | "builder" | "deepdive" | "example" | "quiz";
type ElementKey = "context" | "role" | "objective" | "format" | "tone" | "constraints";
type PromptElements = Record<ElementKey, string>;
type DeepDiveCard = {
    key: ElementKey;
    emoji: string;
    color: string;
    title: string;
    tagline: string;
    description: string;
    before: string;
    beforeWhy: string;
    after: string;
    afterWhy: string;
};
type QuizQuestion = {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
};
type Example = {
    title: string;
    description: string;
    values: PromptElements;
};
type LocalizedCopy = {
    nav: Record<SectionId, string>;
    hero: {
        kicker: string;
        title: string;
        subtitle: string;
        body: string;
        note: string;
    };
    school: {
        title: string;
        body: string;
        note: string;
        classLabel: string;
        classTitle: string;
        classBody: string;
        classStatus: string;
        moreLabel: string;
        moreTitle: string;
        moreBody: string;
    };
    rewriter: {
        title: string;
        body: string;
        placeholder: string;
        action: string;
        result: string;
        combined: string;
        empty: string;
    };
    builder: {
        title: string;
        body: string;
        randomize: string;
        preview: string;
    };
    deepdive: {
        title: string;
        body: string;
    };
    example: {
        title: string;
        body: string;
    };
    quiz: {
        title: string;
        body: string;
        submit: string;
        retry: string;
        tierPerfect: string;
        tierGreat: string;
        tierOk: string;
        tierLow: string;
        scoreLabel: string;
        resultLabel: string;
    };
    teaser: {
        eyebrow: string;
        title: string;
        body: string;
        badge: string;
        action: string;
    };
    controls: {
        themeLight: string;
        themeDark: string;
        langEn: string;
    };
    letters: Record<ElementKey, {
        title: string;
        tagline: string;
        description: string;
    }>;
};
const letterMeta = [
    { key: "context", letter: "C", emoji: "🌍", color: "#f06060" },
    { key: "role", letter: "R", emoji: "🎭", color: "#4ECDC4" },
    { key: "objective", letter: "O", emoji: "🎯", color: "#45B7D1" },
    { key: "format", letter: "F", emoji: "📐", color: "#6ecf8a" },
    { key: "tone", letter: "T", emoji: "🎵", color: "#e8c547" },
    { key: "constraints", letter: "C", emoji: "🚧", color: "#c89bdb" },
] as const;
const builderExampleSets: Record<Lang, Example[]> = {
    en: [
        {
            title: "Launch email",
            description: "Turn a rough request into a clean marketing prompt.",
            values: {
                context: "We are launching a small AI learning course for busy professionals.",
                role: "You are a direct, useful marketing writer.",
                objective: "Write a launch email that gets people to click.",
                format: "Use a short email with a subject line and 3 body paragraphs.",
                tone: "Warm, confident, and practical.",
                constraints: "Do not sound hypey. Keep it under 180 words.",
            },
        },
        {
            title: "Meeting summary",
            description: "Structure a notes prompt so the output is easy to reuse.",
            values: {
                context: "I have notes from a client meeting with decisions, risks, and next steps.",
                role: "You are a sharp project assistant.",
                objective: "Turn my notes into a usable summary.",
                format: "Return a title, key decisions, risks, and next actions.",
                tone: "Clear, neutral, and organized.",
                constraints: "Do not invent missing facts. Flag anything unclear.",
            },
        },
        {
            title: "Support reply",
            description: "Shape a helpful response that stays human and specific.",
            values: {
                context: "A customer is frustrated because a feature is not behaving as expected.",
                role: "You are a calm customer support specialist.",
                objective: "Draft a reply that explains the issue and the fix.",
                format: "Write a short support email with greeting, explanation, and next step.",
                tone: "Reassuring, respectful, and concise.",
                constraints: "Never blame the user. Keep jargon out of the reply.",
            },
        },
    ],
};
const rewriteSamples: Record<Lang, string> = {
    en: "Help me make this better: write a prompt for a newsletter about AI tools for managers.",
};
const deepDiveCards: Record<Lang, DeepDiveCard[]> = {
    en: [
        {
            key: "context",
            emoji: "🌍",
            color: "#f06060",
            title: "Context",
            tagline: "Set the scene first.",
            description: "Tell the model what is happening, who the work is for, and why this prompt exists.",
            before: "Make this better.",
            beforeWhy: "Too vague. The model has to guess the situation.",
            after: "We are preparing a launch email for a small team that already knows the product but needs a short, clear update.",
            afterWhy: "The background gives the model something real to work with.",
        },
        {
            key: "role",
            emoji: "🎭",
            color: "#4ECDC4",
            title: "Role",
            tagline: "Give AI a job.",
            description: "Pick the voice or function you want the model to take on so it can respond with the right mindset.",
            before: "Write this for me.",
            beforeWhy: "The model does not know what kind of helper to become.",
            after: "You are a practical B2B copywriter who keeps advice clear and grounded.",
            afterWhy: "A role narrows the style and the decisions the model makes.",
        },
        {
            key: "objective",
            emoji: "🎯",
            color: "#45B7D1",
            title: "Objective",
            tagline: "Name the outcome.",
            description: "State exactly what success looks like so the model aims at the right target.",
            before: "Improve this.",
            beforeWhy: "It says nothing about the end result.",
            after: "Turn this draft into a 5-bullet executive summary that highlights risks.",
            afterWhy: "The model now knows what the output must accomplish.",
        },
        {
            key: "format",
            emoji: "📐",
            color: "#6ecf8a",
            title: "Format",
            tagline: "Shape the output.",
            description: "Ask for the exact structure you want: bullets, table, checklist, email, memo, JSON, or outline.",
            before: "Give me the answer.",
            beforeWhy: "No structure means messy output.",
            after: "Return a table with columns for issue, impact, and next step.",
            afterWhy: "Format turns a thought into something usable.",
        },
        {
            key: "tone",
            emoji: "🎵",
            color: "#e8c547",
            title: "Tone",
            tagline: "Control the voice.",
            description: "Describe the emotional and stylistic feel you want: calm, direct, warm, premium, or playful.",
            before: "Make it sound nicer.",
            beforeWhy: "Nicer is not a useful instruction.",
            after: "Keep the tone calm, supportive, and confident.",
            afterWhy: "Tone guides how the message should land.",
        },
        {
            key: "constraints",
            emoji: "🚧",
            color: "#c89bdb",
            title: "Constraints",
            tagline: "Draw the boundaries.",
            description: "Add hard rules so the output stays on budget, on brand, or within the limits you need.",
            before: "Do it properly.",
            beforeWhy: "The model still does not know the limits.",
            after: "Do not exceed 120 words. Avoid jargon. Mention only what the source confirms.",
            afterWhy: "Constraints keep the answer honest and usable.",
        },
    ],
};
const quizQuestions: Record<Lang, QuizQuestion[]> = {
    en: [
        {
            question: "Which CROFTC element tells AI the situation it should understand first?",
            options: ["Context", "Tone", "Format", "Constraints"],
            answer: 0,
            explanation: "Context gives the background and the reason the prompt exists.",
        },
        {
            question: "Which element gives AI the job or persona to adopt?",
            options: ["Objective", "Role", "Tone", "Format"],
            answer: 1,
            explanation: "Role tells the model how to behave while it answers.",
        },
        {
            question: "Which element says what success should look like?",
            options: ["Constraints", "Objective", "Tone", "Context"],
            answer: 1,
            explanation: "Objective describes the intended result.",
        },
        {
            question: "Which element asks for bullets, a table, or JSON?",
            options: ["Format", "Role", "Context", "Tone"],
            answer: 0,
            explanation: "Format controls the shape of the output.",
        },
        {
            question: "Which element should be used for calm, direct, or warm language?",
            options: ["Constraints", "Tone", "Objective", "Context"],
            answer: 1,
            explanation: "Tone shapes the voice and emotional feel.",
        },
        {
            question: "Which element is best for word limits or 'do not' rules?",
            options: ["Constraints", "Role", "Format", "Context"],
            answer: 0,
            explanation: "Constraints define the boundaries the model must obey.",
        },
        {
            question: "What usually makes a prompt easier for AI to follow?",
            options: [
                "One sentence with many vague ideas",
                "A clear CROFTC structure",
                "A longer prompt with no limits",
                "Adding more emojis",
            ],
            answer: 1,
            explanation: "CROFTC adds structure that reduces guesswork.",
        },
    ],
};
const fullExample: Record<Lang, PromptElements> = {
    en: {
        context: "We are building a SaaS retention plan for a product team that wants fewer cancellations and better renewals.",
        role: "You are a growth strategist who thinks in practical experiments.",
        objective: "Create a 30-day retention plan that improves upgrades, renewals, and usage.",
        format: "Return a table with columns for segment, action, owner, and expected impact.",
        tone: "Clear, confident, and commercially useful.",
        constraints: "Keep each action realistic for a small team. Do not assume paid ads. Focus on work we can ship this month.",
    },
};
const defaultBuilderValues: Record<Lang, PromptElements> = {
    en: {
        context: "Describe the situation here.",
        role: "Choose the helper role here.",
        objective: "Say what success looks like.",
        format: "Choose the output shape.",
        tone: "Set the voice.",
        constraints: "Add limits, rules, and guardrails.",
    },
};
const localizedCopy: Record<Lang, LocalizedCopy> = {
    en: {
        nav: {
            hero: "Top",
            school: "School",
            rewriter: "Rewriter",
            builder: "Builder",
            deepdive: "Deep dive",
            example: "Example",
            quiz: "Quiz",
        },
        hero: {
            kicker: "The School of AIFA",
            title: "CROFTC",
            subtitle: "Prompt Framework",
            body: "A simple system for writing better AI prompts with Context, Role, Objective, Format, Tone, and Constraints.",
            note: "Use the live tools below to rewrite, build, compare, and test prompts without leaving the page.",
        },
        school: {
            title: "The School of AIFA",
            body: "CROFTC is one class in the school: a practical framework for learning how to write prompts with more clarity and control.",
            note: "More classes can be added later as the school grows.",
            classLabel: "Current class",
            classTitle: "CROFTC",
            classBody: "Learn Context, Role, Objective, Format, Tone, and Constraints through live examples, a builder, and a quiz.",
            classStatus: "Open now",
            moreLabel: "Next classes",
            moreTitle: "More coming soon",
            moreBody: "Prompting lessons, role guides, workflow patterns, and other AIFA teaching modules can live here next.",
        },
        rewriter: {
            title: "Prompt organizer",
            body: "Turn a rough prompt into a CROFTC starting point. This local organizer suggests a structure; review and refine each part before using it.",
            placeholder: "Paste a prompt here. CROFTC will sort it into Context, Role, Objective, Format, Tone, and Constraints.",
            action: "Rewrite prompt",
            result: "Rewritten result",
            combined: "Combined version",
            empty: "Try one of the examples or paste your own prompt.",
        },
        builder: {
            title: "Prompt builder",
            body: "Fill in the six boxes and watch the full prompt assemble itself in real time.",
            randomize: "Randomize example",
            preview: "Live preview",
        },
        deepdive: {
            title: "Letter deep-dive",
            body: "Each CROFTC letter has a job. The examples below show the bad version first and the sharper version next.",
        },
        example: {
            title: "Full example",
            body: "A complete CROFTC prompt for a SaaS retention plan, showing all six elements working together.",
        },
        quiz: {
            title: "Quiz",
            body: "Test whether you can spot the six CROFTC elements in real prompts.",
            submit: "Check score",
            retry: "Retry",
            tierPerfect: "Perfect",
            tierGreat: "Great",
            tierOk: "OK",
            tierLow: "Low",
            scoreLabel: "Score",
            resultLabel: "You got",
        },
        teaser: {
            eyebrow: "The School of AIFA",
            title: "CROFTC is one class in the school.",
            body: "A compact learning page for people who want a better prompt system without the noise.",
            badge: "Interactive class",
            action: "Open class",
        },
        controls: {
            themeLight: "Light",
            themeDark: "Dark",
            langEn: "English",
        },
        letters: {
            context: {
                title: "Context",
                tagline: "Set the scene.",
                description: "Give the model the situation, audience, and reason the prompt exists.",
            },
            role: {
                title: "Role",
                tagline: "Give it a job.",
                description: "Tell the model what kind of helper it should become for this task.",
            },
            objective: {
                title: "Objective",
                tagline: "Name the outcome.",
                description: "Be explicit about what the output must accomplish.",
            },
            format: {
                title: "Format",
                tagline: "Shape the answer.",
                description: "Choose the exact structure: bullets, table, memo, email, JSON, or outline.",
            },
            tone: {
                title: "Tone",
                tagline: "Set the voice.",
                description: "Tune the style to feel calm, direct, warm, premium, or playful.",
            },
            constraints: {
                title: "Constraints",
                tagline: "Draw the line.",
                description: "Add the rules, limits, and must-not-dos that keep the output honest.",
            },
        },
    },
};
function normalize(value: string) {
    return value.trim().replace(/\s+/g, " ");
}
function makePrompt(elements: PromptElements) {
    const labels = {
        context: "Context",
        role: "Role",
        objective: "Objective",
        format: "Format",
        tone: "Tone",
        constraints: "Constraints",
    };
    return (Object.keys(labels) as ElementKey[])
        .map((key) => `${labels[key]}: ${elements[key]}`)
        .join("\n");
}
function detectRole(text: string) {
    const patterns = [
        /you are\s+([^.,\n]+)/i,
        /act as\s+([^.,\n]+)/i,
        /be\s+([^.,\n]+)/i,
        /eres\s+([^.,\n]+)/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1])
            return match[1].trim();
    }
    return "a useful and precise assistant";
}
function detectObjective(text: string) {
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map(normalize)
        .filter(Boolean);
    const cleaned = sentences.find((sentence) => !/you are|act as|be |eres /i.test(sentence));
    if (cleaned)
        return cleaned;
    return "Create a clear answer that helps the user act.";
}
function detectContext(text: string) {
    const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
    const trimmed = normalize(firstSentence);
    if (trimmed)
        return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
    return "No context was provided.";
}
function detectFormat(text: string) {
    const lower = text.toLowerCase();
    if (/table|tabla/.test(lower))
        return "A table with clear columns.";
    if (/json/.test(lower))
        return "JSON";
    if (/checklist|lista de verificación/.test(lower))
        return "A checklist.";
    if (/bullet|bullets|viñetas/.test(lower))
        return "Bullets.";
    if (/email|correo/.test(lower))
        return "An email draft.";
    if (/memo|mемо/.test(lower))
        return "A memo.";
    return "A simple, readable structure.";
}
function detectTone(text: string) {
    const lower = text.toLowerCase();
    const matches = [
        "warm",
        "cálido",
        "confident",
        "seguro",
        "professional",
        "profesional",
        "friendly",
        "amable",
        "direct",
        "directo",
        "calm",
        "calmado",
        "supportive",
        "útil",
        "premium",
        "clear",
        "claro",
    ].filter((tone) => lower.includes(tone));
    if (matches.length > 0)
        return matches.join(", ");
    return "Clear, helpful, and natural.";
}
function detectConstraints(text: string) {
    const lower = text.toLowerCase();
    const fragments = [
        ...(lower.match(/do not [^.,;!?]+/g) ?? []),
        ...(lower.match(/don't [^.,;!?]+/g) ?? []),
        ...(lower.match(/avoid [^.,;!?]+/g) ?? []),
        ...(lower.match(/must [^.,;!?]+/g) ?? []),
        ...(lower.match(/no [^.,;!?]+/g) ?? []),
        ...(lower.match(/mantén[^.,;!?]+/g) ?? []),
    ];
    const cleaned = fragments.map((fragment) => normalize(fragment)).filter(Boolean);
    if (cleaned.length > 0)
        return cleaned.slice(0, 3).join(" | ");
    return "No explicit constraints were given.";
}
function rewritePrompt(input: string): PromptElements {
    const normalized = normalize(input);
    return {
        context: detectContext(normalized),
        role: detectRole(normalized),
        objective: detectObjective(normalized),
        format: detectFormat(normalized),
        tone: detectTone(normalized),
        constraints: detectConstraints(normalized),
    };
}
function scoreTier(score: number, total: number, copy: LocalizedCopy) {
    if (score === total)
        return copy.quiz.tierPerfect;
    if (score >= total - 1)
        return copy.quiz.tierGreat;
    if (score >= Math.ceil(total / 2))
        return copy.quiz.tierOk;
    return copy.quiz.tierLow;
}
export function PromptingFrameworkClient() {
    const lang: Lang = "en";
    const [rewriteInput, setRewriteInput] = useState(rewriteSamples.en);
    const [rewriteResult, setRewriteResult] = useState<PromptElements | null>(null);
    const [builder, setBuilder] = useState<PromptElements>(defaultBuilderValues.en);
    const [exampleIndex, setExampleIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(quizQuestions.en.length).fill(-1));
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [copyStatus, setCopyStatus] = useState("");
    async function copyPrompt(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus("Prompt copied.");
        } catch {
            setCopyStatus("Copy is unavailable. Select the prompt text to copy it.");
        }
    }
    const bootedRef = useRef(false);
    const copy = localizedCopy[lang];
    const currentExamples = builderExampleSets[lang];
    const currentQuizzes = quizQuestions[lang];
    const currentDeepDives = deepDiveCards[lang];
    const fullPrompt = useMemo(() => makePrompt(builder), [builder]);
    const rewrittenPrompt = useMemo(() => (rewriteResult ? makePrompt(rewriteResult) : ""), [rewriteResult]);
    const quizScore = quizAnswers.reduce((total, answer, index) => total + (answer === currentQuizzes[index].answer ? 1 : 0), 0);
    const quizTier = scoreTier(quizScore, currentQuizzes.length, copy);
    useEffect(() => {
        let storedBuilder: string | null = null;
        let storedExample: string | null = null;
        try {
            storedBuilder = window.localStorage.getItem("croftc-builder");
            storedExample = window.localStorage.getItem("croftc-example");
        }
        catch { /* The tools remain usable when browser storage is blocked. */ }
        const frame = window.requestAnimationFrame(() => {
            if (storedBuilder) {
                try {
                    const parsed = JSON.parse(storedBuilder);
                    if (parsed && Object.keys(defaultBuilderValues.en).every(key => typeof parsed[key] === "string"))
                        setBuilder(parsed as PromptElements);
                }
                catch {
                    setBuilder(defaultBuilderValues.en);
                }
            }
            if (storedExample) {
                const parsed = Number.parseInt(storedExample, 10);
                if (Number.isInteger(parsed) && parsed >= 0)
                    setExampleIndex(parsed % currentExamples.length);
            }
            bootedRef.current = true;
        });
        return () => window.cancelAnimationFrame(frame);
    }, [currentExamples.length]);
    useEffect(() => {
        if (!bootedRef.current)
            return;
        try {
            window.localStorage.setItem("croftc-builder", JSON.stringify(builder));
            window.localStorage.setItem("croftc-example", String(exampleIndex));
        }
        catch { /* Saving is optional; editing is still available. */ }
    }, [builder, exampleIndex]);
    useEffect(() => {
        const revealNodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        revealNodes.forEach((node) => {
            if (!reduced && node.getBoundingClientRect().top >= window.innerHeight) node.classList.add("will-reveal");
            revealObserver.observe(node);
        });
        return () => {
            revealObserver.disconnect();
            revealNodes.forEach(node => node.classList.remove("will-reveal"));
        };
    }, []);
    function loadExample(index: number) {
        setExampleIndex(index);
        setBuilder(currentExamples[index].values);
    }
    async function sendRewrite() {
        const rewritten = rewritePrompt(rewriteInput);
        setRewriteResult(rewritten);
    }
    return (<ThemeShell activeItem="croftc">
      <div className="croftc-main">
        <section id="hero" className="croftc-section croftc-hero" data-reveal>
          <div className="croftc-hero-copy">
            <p className="croftc-kicker">{copy.hero.kicker}</p>
            <h1>{copy.hero.title}</h1>
            <p className="croftc-subtitle">{copy.hero.subtitle}</p>
            <p className="croftc-body">{copy.hero.body}</p>
            <p className="croftc-note">{copy.hero.note}</p>
            <div className="hero-actions"><a className="button primary" href="#builder">Build a prompt</a><a className="button secondary" href="#deepdive">Learn the six parts</a></div>
          </div>
          <div className="croftc-strip" aria-label="CROFTC letters">
            {letterMeta.map((letter) => {
            const letterCopy = copy.letters[letter.key];
            return (<article key={letter.key} className="croftc-letter" style={{ ["--accent" as string]: letter.color }}>
                  <span>{letter.emoji}</span>
                  <strong>{letter.letter}</strong>
                  <h2>{letterCopy.title}</h2>
                  <p>{letterCopy.tagline}</p>
                </article>);
        })}
          </div>
        </section>

        <section id="school" className="croftc-section croftc-school" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.school.title}</p>
            <h2>Learn it. Try it. Make it yours.</h2>
          </div>
          <nav className="lesson-outline" aria-label="CROFTC lesson sections">
            <a href="#deepdive"><span>01 / Understand</span><strong>The six parts</strong><p>See why each element matters through before-and-after examples.</p></a>
            <a href="#builder"><span>02 / Practice</span><strong>Your own brief</strong><p>Shape a prompt around real work and take the result with you.</p></a>
            <a href="#quiz"><span>03 / Check</span><strong>Seven questions</strong><p>Test your understanding, read the explanations, and try again.</p></a>
          </nav>
        </section>

        <section id="rewriter" className="croftc-section croftc-rewriter" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.rewriter.title}</p>
            <h2>{copy.rewriter.body}</h2>
          </div>
          <div className="croftc-rewriter-stack">
            <article className="croftc-panel">
              <label htmlFor="croftc-rewrite-input" className="croftc-label">
                {copy.rewriter.title}
              </label>
              <textarea id="croftc-rewrite-input" value={rewriteInput} onChange={(event) => setRewriteInput(event.target.value)} placeholder={copy.rewriter.placeholder}/>
              <div className="croftc-actions">
                <button type="button" className="croftc-button primary" disabled={!rewriteInput.trim()} onClick={sendRewrite}>
                  {copy.rewriter.action}
                </button>
                <button type="button" className="croftc-button secondary" onClick={() => loadExample(exampleIndex)}>
                  {copy.builder.randomize}
                </button>
              </div>
            </article>
            <article className="croftc-panel croftc-result">
              <label className="croftc-label">{copy.rewriter.result}</label>
              {rewriteResult ? (<div className="croftc-result-grid">
                  {letterMeta.map((letter) => (<div key={letter.key} className="croftc-result-card" style={{ ["--accent" as string]: letter.color }}>
                      <span>{letter.key}</span>
                      <p>{rewriteResult[letter.key]}</p>
                    </div>))}
                </div>) : (<p className="croftc-empty">{copy.rewriter.empty}</p>)}
              <div className="croftc-combined">
                <button type="button" className="copy-prompt-button" aria-label="Copy organized prompt" title="Copy organized prompt" disabled={!rewriteResult} onClick={() => copyPrompt(rewrittenPrompt)}><Copy size={18} aria-hidden="true" /></button>
                <span>{copy.rewriter.combined}</span>
                <pre>{rewriteResult ? rewrittenPrompt : makePrompt(rewritePrompt(rewriteInput))}</pre>
              </div>
            </article>
          </div>
        </section>

        <section id="builder" className="croftc-section croftc-builder" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.builder.title}</p>
            <h2>{copy.builder.body}</h2>
          </div>
          <div className="croftc-builder-actions">
            {currentExamples.map((example, index) => (<button key={example.title} type="button" className="croftc-chip" onClick={() => loadExample(index)}>
                {example.title}
              </button>))}
            <button type="button" className="croftc-chip primary" onClick={() => {
            const nextIndex = (exampleIndex + 1) % currentExamples.length;
            loadExample(nextIndex);
        }}>
              {copy.builder.randomize}
            </button>
          </div>
          <div className="croftc-builder-grid">
            {letterMeta.map((letter) => (<label key={letter.key} className="croftc-field" style={{ ["--accent" as string]: letter.color }}>
                <span>
                  {letter.letter} {copy.letters[letter.key].title}
                </span>
                <textarea value={builder[letter.key]} onChange={(event) => setBuilder((current) => ({ ...current, [letter.key]: event.target.value }))}/>
              </label>))}
          </div>
          <aside className="croftc-preview">
            <button type="button" className="copy-prompt-button" aria-label="Copy built prompt" title="Copy built prompt" disabled={!fullPrompt.trim()} onClick={() => copyPrompt(fullPrompt)}><Copy size={18} aria-hidden="true" /></button>
            <p className="croftc-label">{copy.builder.preview}</p>
            <pre>{fullPrompt}</pre>
          </aside>
          <p className="copy-status" role="status">{copyStatus}</p>
        </section>

        <section id="deepdive" className="croftc-section croftc-deepdive" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.deepdive.title}</p>
            <h2>{copy.deepdive.body}</h2>
          </div>
          <div className="croftc-deep-grid">
            {currentDeepDives.map((card) => (<article key={card.key} className="croftc-deep-card" style={{ ["--accent" as string]: card.color }}>
                <p className="croftc-deep-meta">
                  <span>{card.emoji}</span> {card.title}
                </p>
                <h3>{card.tagline}</h3>
                <p>{card.description}</p>
                <div className="croftc-example-pair">
                  <div>
                    <span>Before</span>
                    <p>{card.before}</p>
                    <small>{card.beforeWhy}</small>
                  </div>
                  <div>
                    <span>After</span>
                    <p>{card.after}</p>
                    <small>{card.afterWhy}</small>
                  </div>
                </div>
              </article>))}
          </div>
        </section>

        <section id="example" className="croftc-section croftc-example" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.example.title}</p>
            <h2>{copy.example.body}</h2>
          </div>
          <article className="croftc-example-shell">
            <div className="croftc-example-grid">
              {letterMeta.map((letter) => (<div key={letter.key} className="croftc-example-block" style={{ ["--accent" as string]: letter.color }}>
                  <span>{copy.letters[letter.key].title}</span>
                  <p>{fullExample[lang][letter.key]}</p>
                </div>))}
            </div>
          </article>
        </section>

        <section id="quiz" className="croftc-section croftc-quiz" data-reveal>
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.quiz.title}</p>
            <h2>{copy.quiz.body}</h2>
          </div>
          <div className="croftc-quiz-grid">
            {currentQuizzes.map((item, questionIndex) => (<article key={item.question} className="croftc-quiz-card">
                <h3>{questionIndex + 1}. {item.question}</h3>
                <div className="croftc-quiz-options">
                  {item.options.map((option, optionIndex) => (<button key={option} type="button" className={quizAnswers[questionIndex] === optionIndex ? "is-selected" : ""} aria-pressed={quizAnswers[questionIndex] === optionIndex} disabled={quizSubmitted} onClick={() => {
                    setQuizAnswers((current) => {
                        const next = [...current];
                        next[questionIndex] = optionIndex;
                        return next;
                    });
                }}>
                      {option}
                    </button>))}
                </div>
                {quizSubmitted ? (<p className={quizAnswers[questionIndex] === item.answer ? "is-correct" : "is-wrong"}>
                    {item.explanation}
                  </p>) : null}
              </article>))}
          </div>
          <div className="croftc-quiz-footer">
            <div className="croftc-quiz-score" role="status">
              <strong>
                {quizSubmitted ? `${copy.quiz.scoreLabel}: ${quizScore}/${currentQuizzes.length}` : `${quizAnswers.filter(answer => answer >= 0).length} of ${currentQuizzes.length} answered`}
              </strong>
              <span>
                {quizSubmitted ? `${copy.quiz.resultLabel} ${quizTier}` : "Answer each question, then check your understanding."}
              </span>
            </div>
            <div className="croftc-actions">
              <button type="button" className="croftc-button primary" disabled={quizAnswers.some(answer => answer < 0) || quizSubmitted} onClick={() => setQuizSubmitted(true)}>
                {copy.quiz.submit}
              </button>
              <button type="button" className="croftc-button secondary" onClick={() => {
            setQuizSubmitted(false);
            setQuizAnswers(Array(currentQuizzes.length).fill(-1));
        }}>
                {copy.quiz.retry}
              </button>
            </div>
          </div>
        </section>

        <section className="croftc-section croftc-teaser" data-reveal>
          <p className="croftc-kicker">{copy.teaser.eyebrow}</p>
          <div className="croftc-teaser-shell">
            <div>
              <h2>{copy.teaser.title}</h2>
              <p>{copy.teaser.body}</p>
            </div>
            <div className="croftc-teaser-actions">
              <span>{copy.teaser.badge}</span>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="croftc-button primary" href="/">
                {copy.teaser.action}
              </a>
            </div>
          </div>
        </section>
      </div>
    </ThemeShell>);
}
