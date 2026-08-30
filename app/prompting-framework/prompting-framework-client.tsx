"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteTopbar } from "../components/SiteTopbar";

type ThemeMode = "dark" | "light";
type Lang = "en" | "es";
type SectionId =
  | "hero"
  | "school"
  | "rewriter"
  | "builder"
  | "deepdive"
  | "example"
  | "quiz";

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
  letters: Record<
    ElementKey,
    {
      title: string;
      tagline: string;
      description: string;
    }
  >;
};

const THEME_KEY = "croftc-theme";

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
        context:
          "We are launching a small AI learning course for busy professionals.",
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
        context:
          "I have notes from a client meeting with decisions, risks, and next steps.",
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
        context:
          "A customer is frustrated because a feature is not behaving as expected.",
        role: "You are a calm customer support specialist.",
        objective: "Draft a reply that explains the issue and the fix.",
        format: "Write a short support email with greeting, explanation, and next step.",
        tone: "Reassuring, respectful, and concise.",
        constraints: "Never blame the user. Keep jargon out of the reply.",
      },
    },
  ],
  es: [
    {
      title: "Correo de lanzamiento",
      description: "Convierte una petición simple en un prompt de marketing claro.",
      values: {
        context:
          "Estamos lanzando un pequeño curso de IA para profesionales ocupados.",
        role: "Eres un redactor de marketing directo y útil.",
        objective: "Escribe un correo de lanzamiento que invite a hacer clic.",
        format:
          "Usa un correo corto con una línea de asunto y 3 párrafos.",
        tone: "Cálido, seguro y práctico.",
        constraints: "No suenes exagerado. Manténlo por debajo de 180 palabras.",
      },
    },
    {
      title: "Resumen de reunión",
      description: "Estructura notas para que el resultado sea reutilizable.",
      values: {
        context:
          "Tengo notas de una reunión con decisiones, riesgos y siguientes pasos.",
        role: "Eres un asistente de proyectos preciso.",
        objective: "Convierte mis notas en un resumen útil.",
        format:
          "Devuelve un título, decisiones clave, riesgos y acciones siguientes.",
        tone: "Claro, neutral y ordenado.",
        constraints: "No inventes datos. Señala lo que no esté claro.",
      },
    },
    {
      title: "Respuesta de soporte",
      description: "Diseña una respuesta útil que siga siendo humana.",
      values: {
        context:
          "Un cliente está frustrado porque una función no está funcionando como esperaba.",
        role: "Eres un especialista de soporte tranquilo.",
        objective: "Redacta una respuesta que explique el problema y la solución.",
        format:
          "Escribe un correo breve con saludo, explicación y siguiente paso.",
        tone: "Tranquilizador, respetuoso y breve.",
        constraints: "Nunca culpes al usuario. Evita la jerga.",
      },
    },
  ],
};

const rewriteSamples: Record<Lang, string> = {
  en: "Help me make this better: write a prompt for a newsletter about AI tools for managers.",
  es: "Ayúdame a mejorar esto: escribe un prompt para un boletín sobre herramientas de IA para managers.",
};

const deepDiveCards: Record<Lang, DeepDiveCard[]> = {
  en: [
    {
      key: "context",
      emoji: "🌍",
      color: "#f06060",
      title: "Context",
      tagline: "Set the scene first.",
      description:
        "Tell the model what is happening, who the work is for, and why this prompt exists.",
      before: "Make this better.",
      beforeWhy: "Too vague. The model has to guess the situation.",
      after:
        "We are preparing a launch email for a small team that already knows the product but needs a short, clear update.",
      afterWhy: "The background gives the model something real to work with.",
    },
    {
      key: "role",
      emoji: "🎭",
      color: "#4ECDC4",
      title: "Role",
      tagline: "Give AI a job.",
      description:
        "Pick the voice or function you want the model to take on so it can respond with the right mindset.",
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
      description:
        "State exactly what success looks like so the model aims at the right target.",
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
      description:
        "Ask for the exact structure you want: bullets, table, checklist, email, memo, JSON, or outline.",
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
      description:
        "Describe the emotional and stylistic feel you want: calm, direct, warm, premium, or playful.",
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
      description:
        "Add hard rules so the output stays on budget, on brand, or within the limits you need.",
      before: "Do it properly.",
      beforeWhy: "The model still does not know the limits.",
      after: "Do not exceed 120 words. Avoid jargon. Mention only what the source confirms.",
      afterWhy: "Constraints keep the answer honest and usable.",
    },
  ],
  es: [
    {
      key: "context",
      emoji: "🌍",
      color: "#f06060",
      title: "Contexto",
      tagline: "Primero el escenario.",
      description:
        "Explica qué está pasando, para quién es el trabajo y por qué existe este prompt.",
      before: "Hazlo mejor.",
      beforeWhy: "Es demasiado vago. La IA tiene que adivinar.",
      after:
        "Estamos preparando un correo de lanzamiento para un equipo pequeño que ya conoce el producto, pero necesita una actualización breve y clara.",
      afterWhy: "El contexto le da a la IA algo real con lo que trabajar.",
    },
    {
      key: "role",
      emoji: "🎭",
      color: "#4ECDC4",
      title: "Rol",
      tagline: "Dale un trabajo.",
      description:
        "Elige la voz o función que quieres que adopte el modelo para que responda con el enfoque correcto.",
      before: "Escríbelo por mí.",
      beforeWhy: "La IA no sabe qué tipo de ayuda debe ser.",
      after: "Eres un redactor B2B práctico que mantiene las ideas claras y concretas.",
      afterWhy: "El rol reduce el estilo y las decisiones del modelo.",
    },
    {
      key: "objective",
      emoji: "🎯",
      color: "#45B7D1",
      title: "Objetivo",
      tagline: "Nombra el resultado.",
      description:
        "Di exactamente cómo se ve el éxito para que el modelo apunte al objetivo correcto.",
      before: "Mejora esto.",
      beforeWhy: "No dice nada sobre el resultado final.",
      after: "Convierte este borrador en un resumen ejecutivo de 5 puntos que destaque riesgos.",
      afterWhy: "La IA ya sabe qué debe lograr el resultado.",
    },
    {
      key: "format",
      emoji: "📐",
      color: "#6ecf8a",
      title: "Formato",
      tagline: "Da forma al resultado.",
      description:
        "Pide la estructura exacta que quieres: viñetas, tabla, checklist, correo, memo, JSON o esquema.",
      before: "Dame la respuesta.",
      beforeWhy: "Sin estructura, el resultado suele ser confuso.",
      after: "Devuelve una tabla con columnas para problema, impacto y siguiente paso.",
      afterWhy: "El formato convierte una idea en algo utilizable.",
    },
    {
      key: "tone",
      emoji: "🎵",
      color: "#e8c547",
      title: "Tono",
      tagline: "Controla la voz.",
      description:
        "Describe el estilo emocional que quieres: calmado, directo, cálido, premium o lúdico.",
      before: "Hazlo más amable.",
      beforeWhy: "Amable no es una instrucción útil.",
      after: "Mantén un tono calmado, cercano y seguro.",
      afterWhy: "El tono guía cómo se recibe el mensaje.",
    },
    {
      key: "constraints",
      emoji: "🚧",
      color: "#c89bdb",
      title: "Restricciones",
      tagline: "Marca los límites.",
      description:
        "Añade reglas firmes para mantener el resultado dentro del presupuesto, la marca o el marco necesario.",
      before: "Hazlo bien.",
      beforeWhy: "La IA aún no sabe cuáles son los límites.",
      after: "No pases de 120 palabras. Evita la jerga. Menciona solo lo confirmado por la fuente.",
      afterWhy: "Las restricciones mantienen la respuesta honesta y utilizable.",
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
  es: [
    {
      question: "¿Qué elemento CROFTC le dice a la IA qué situación debe entender primero?",
      options: ["Contexto", "Tono", "Formato", "Restricciones"],
      answer: 0,
      explanation: "El contexto aporta el fondo y la razón del prompt.",
    },
    {
      question: "¿Qué elemento le da a la IA el rol o la persona que debe adoptar?",
      options: ["Objetivo", "Rol", "Tono", "Formato"],
      answer: 1,
      explanation: "El rol le indica al modelo cómo comportarse al responder.",
    },
    {
      question: "¿Qué elemento dice cómo debe verse el éxito?",
      options: ["Restricciones", "Objetivo", "Tono", "Contexto"],
      answer: 1,
      explanation: "El objetivo describe el resultado deseado.",
    },
    {
      question: "¿Qué elemento pide viñetas, una tabla o JSON?",
      options: ["Formato", "Rol", "Contexto", "Tono"],
      answer: 0,
      explanation: "El formato controla la forma del resultado.",
    },
    {
      question: "¿Qué elemento se usa para un lenguaje calmado, directo o cálido?",
      options: ["Restricciones", "Tono", "Objetivo", "Contexto"],
      answer: 1,
      explanation: "El tono moldea la voz y el matiz emocional.",
    },
    {
      question: "¿Qué elemento sirve para límites de palabras o reglas de 'no hagas'?",
      options: ["Restricciones", "Rol", "Formato", "Contexto"],
      answer: 0,
      explanation: "Las restricciones marcan los límites que el modelo debe seguir.",
    },
    {
      question: "¿Qué suele hacer que un prompt sea más fácil de seguir?",
      options: [
        "Una frase con muchas ideas vagas",
        "Una estructura CROFTC clara",
        "Un prompt más largo sin límites",
        "Añadir más emojis",
      ],
      answer: 1,
      explanation: "CROFTC agrega estructura y reduce la improvisación.",
    },
  ],
};

const fullExample: Record<Lang, PromptElements> = {
  en: {
    context:
      "We are building a SaaS retention plan for a product team that wants fewer cancellations and better renewals.",
    role: "You are a growth strategist who thinks in practical experiments.",
    objective:
      "Create a 30-day retention plan that improves upgrades, renewals, and usage.",
    format:
      "Return a table with columns for segment, action, owner, and expected impact.",
    tone: "Clear, confident, and commercially useful.",
    constraints:
      "Keep each action realistic for a small team. Do not assume paid ads. Focus on work we can ship this month.",
  },
  es: {
    context:
      "Estamos creando un plan de retención para un producto SaaS y buscamos menos cancelaciones y mejores renovaciones.",
    role: "Eres un estratega de crecimiento que piensa en experimentos prácticos.",
    objective:
      "Crea un plan de retención de 30 días que mejore upgrades, renovaciones y uso.",
    format:
      "Devuelve una tabla con columnas para segmento, acción, responsable e impacto esperado.",
    tone: "Claro, seguro y útil para negocio.",
    constraints:
      "Mantén cada acción realista para un equipo pequeño. No supongas anuncios pagos. Concéntrate en lo que podemos publicar este mes.",
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
  es: {
    context: "Describe aquí la situación.",
    role: "Elige aquí el rol de ayuda.",
    objective: "Di cómo se ve el éxito.",
    format: "Elige la forma del resultado.",
    tone: "Define la voz.",
    constraints: "Añade límites, reglas y guardrails.",
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
      body:
        "A simple system for writing better AI prompts with Context, Role, Objective, Format, Tone, and Constraints.",
      note:
        "Use the live tools below to rewrite, build, compare, and test prompts without leaving the page.",
    },
    school: {
      title: "The School of AIFA",
      body:
        "CROFTC is one class in the school: a practical framework for learning how to write prompts with more clarity and control.",
      note: "More classes can be added later as the school grows.",
      classLabel: "Current class",
      classTitle: "CROFTC",
      classBody:
        "Learn Context, Role, Objective, Format, Tone, and Constraints through live examples, a builder, and a quiz.",
      classStatus: "Open now",
      moreLabel: "Next classes",
      moreTitle: "More coming soon",
      moreBody:
        "Prompting lessons, role guides, workflow patterns, and other AIFA teaching modules can live here next.",
    },
    rewriter: {
      title: "AI prompt rewriter",
      body:
        "Paste a rough prompt and CROFTC will restructure it into the six parts with a combined version underneath.",
      placeholder: "Paste a prompt here. CROFTC will sort it into Context, Role, Objective, Format, Tone, and Constraints.",
      action: "Rewrite prompt",
      result: "Rewritten result",
      combined: "Combined version",
      empty: "Try one of the examples or paste your own prompt.",
    },
    builder: {
      title: "Prompt builder",
      body:
        "Fill in the six boxes and watch the full prompt assemble itself in real time.",
      randomize: "Randomize example",
      preview: "Live preview",
    },
    deepdive: {
      title: "Letter deep-dive",
      body:
        "Each CROFTC letter has a job. The examples below show the bad version first and the sharper version next.",
    },
    example: {
      title: "Full example",
      body:
        "A complete CROFTC prompt for a SaaS retention plan, showing all six elements working together.",
    },
    quiz: {
      title: "Quiz",
      body:
        "Test whether you can spot the six CROFTC elements in real prompts.",
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
      body:
        "A compact learning page for people who want a better prompt system without the noise.",
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
        description:
          "Give the model the situation, audience, and reason the prompt exists.",
      },
      role: {
        title: "Role",
        tagline: "Give it a job.",
        description:
          "Tell the model what kind of helper it should become for this task.",
      },
      objective: {
        title: "Objective",
        tagline: "Name the outcome.",
        description:
          "Be explicit about what the output must accomplish.",
      },
      format: {
        title: "Format",
        tagline: "Shape the answer.",
        description:
          "Choose the exact structure: bullets, table, memo, email, JSON, or outline.",
      },
      tone: {
        title: "Tone",
        tagline: "Set the voice.",
        description:
          "Tune the style to feel calm, direct, warm, premium, or playful.",
      },
      constraints: {
        title: "Constraints",
        tagline: "Draw the line.",
        description:
          "Add the rules, limits, and must-not-dos that keep the output honest.",
      },
    },
  },
  es: {
    nav: {
      hero: "Inicio",
      metrics: "Métricas",
      rewriter: "Reescribir",
      builder: "Construir",
      deepdive: "Detalle",
      example: "Ejemplo",
      quiz: "Quiz",
    },
    hero: {
      kicker: "The School of AIFA",
      title: "CROFTC",
      subtitle: "Prompt Framework",
      body:
        "Un sistema simple para escribir mejores prompts con Contexto, Rol, Objetivo, Formato, Tono y Restricciones.",
      note:
        "Usa las herramientas en vivo para reescribir, construir, comparar y probar prompts sin salir de la página.",
    },
    school: {
      title: "The School of AIFA",
      body:
        "CROFTC es una clase dentro de la escuela: un marco práctico para aprender a escribir prompts con más claridad y control.",
      note: "Más clases podrán agregarse después a medida que crezca la escuela.",
      classLabel: "Clase actual",
      classTitle: "CROFTC",
      classBody:
        "Aprende Contexto, Rol, Objetivo, Formato, Tono y Restricciones con ejemplos en vivo, un constructor y un quiz.",
      classStatus: "Abierto ahora",
      moreLabel: "Próximas clases",
      moreTitle: "Más pronto",
      moreBody:
        "Lecciones de prompting, guías por rol, patrones de workflows y otros módulos de enseñanza AIFA pueden vivir aquí después.",
    },
    rewriter: {
      title: "Reescritor de prompts",
      body:
        "Pega un prompt básico y CROFTC lo reorganiza en las seis partes con una versión combinada al final.",
      placeholder: "Pega un prompt aquí. CROFTC lo ordenará en Contexto, Rol, Objetivo, Formato, Tono y Restricciones.",
      action: "Reescribir prompt",
      result: "Resultado reescrito",
      combined: "Versión combinada",
      empty: "Prueba uno de los ejemplos o pega el tuyo.",
    },
    builder: {
      title: "Constructor de prompts",
      body:
        "Completa las seis cajas y mira cómo el prompt se arma en tiempo real.",
      randomize: "Ejemplo aleatorio",
      preview: "Vista previa",
    },
    deepdive: {
      title: "Detalle por letra",
      body:
        "Cada letra de CROFTC tiene un trabajo. Los ejemplos muestran primero la versión floja y después la versión más clara.",
    },
    example: {
      title: "Ejemplo completo",
      body:
        "Un prompt CROFTC completo para un plan de retención SaaS, con las seis partes trabajando juntas.",
    },
    quiz: {
      title: "Quiz",
      body:
        "Comprueba si puedes identificar las seis partes de CROFTC en prompts reales.",
      submit: "Ver puntaje",
      retry: "Reintentar",
      tierPerfect: "Perfecto",
      tierGreat: "Muy bien",
      tierOk: "OK",
      tierLow: "Bajo",
      scoreLabel: "Puntaje",
      resultLabel: "Obtuviste",
    },
    teaser: {
      eyebrow: "The School of AIFA",
      title: "CROFTC es una clase dentro de la escuela.",
      body:
        "Una página compacta para aprender un sistema de prompts mejor sin ruido.",
      badge: "Clase interactiva",
      action: "Abrir clase",
    },
    controls: {
      themeLight: "Claro",
      themeDark: "Oscuro",
      langEn: "English",
    },
    letters: {
      context: {
        title: "Contexto",
        tagline: "Da el escenario.",
        description:
          "Dile al modelo la situación, la audiencia y por qué existe el prompt.",
      },
      role: {
        title: "Rol",
        tagline: "Dale un trabajo.",
        description:
          "Dile al modelo qué tipo de ayuda debe ser para esta tarea.",
      },
      objective: {
        title: "Objetivo",
        tagline: "Nombra el resultado.",
        description:
          "Sé claro sobre qué debe lograr el resultado.",
      },
      format: {
        title: "Formato",
        tagline: "Da forma a la respuesta.",
        description:
          "Elige la estructura exacta: viñetas, tabla, memo, correo, JSON o esquema.",
      },
      tone: {
        title: "Tono",
        tagline: "Define la voz.",
        description:
          "Ajusta el estilo para que suene calmado, directo, cálido, premium o lúdico.",
      },
      constraints: {
        title: "Restricciones",
        tagline: "Marca el límite.",
        description:
          "Añade reglas, límites y cosas que no se deben hacer para mantener la respuesta honesta.",
      },
    },
  },
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function makePrompt(elements: PromptElements, lang: Lang) {
  const labels = lang === "es"
    ? {
        context: "Contexto",
        role: "Rol",
        objective: "Objetivo",
        format: "Formato",
        tone: "Tono",
        constraints: "Restricciones",
      }
    : {
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

function detectRole(text: string, lang: Lang) {
  const patterns = [
    /you are\s+([^.,\n]+)/i,
    /act as\s+([^.,\n]+)/i,
    /be\s+([^.,\n]+)/i,
    /eres\s+([^.,\n]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return lang === "es"
    ? "un asistente útil y preciso"
    : "a useful and precise assistant";
}

function detectObjective(text: string, lang: Lang) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(normalize)
    .filter(Boolean);
  const cleaned = sentences.find((sentence) => !/you are|act as|be |eres /i.test(sentence));
  if (cleaned) return cleaned;
  return lang === "es"
    ? "Crea una respuesta clara que ayude a actuar."
    : "Create a clear answer that helps the user act.";
}

function detectContext(text: string, lang: Lang) {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  const trimmed = normalize(firstSentence);
  if (trimmed) return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
  return lang === "es"
    ? "No context was provided."
    : "No context was provided.";
}

function detectFormat(text: string, lang: Lang) {
  const lower = text.toLowerCase();
  if (/table|tabla/.test(lower)) return lang === "es" ? "Una tabla con columnas claras." : "A table with clear columns.";
  if (/json/.test(lower)) return "JSON";
  if (/checklist|lista de verificación/.test(lower)) return lang === "es" ? "Una lista de verificación." : "A checklist.";
  if (/bullet|bullets|viñetas/.test(lower)) return lang === "es" ? "Viñetas." : "Bullets.";
  if (/email|correo/.test(lower)) return lang === "es" ? "Un borrador de correo." : "An email draft.";
  if (/memo|mемо/.test(lower)) return lang === "es" ? "Un memorando." : "A memo.";
  return lang === "es" ? "Una estructura simple y legible." : "A simple, readable structure.";
}

function detectTone(text: string, lang: Lang) {
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
  if (matches.length > 0) return lang === "es" ? "Claro, útil y natural." : matches.join(", ");
  return lang === "es" ? "Claro, útil y natural." : "Clear, helpful, and natural.";
}

function detectConstraints(text: string, lang: Lang) {
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
  if (cleaned.length > 0) return cleaned.slice(0, 3).join(" | ");
  return lang === "es"
    ? "No explicit constraints were given."
    : "No explicit constraints were given.";
}

function rewritePrompt(input: string, lang: Lang): PromptElements {
  const normalized = normalize(input);
  return {
    context: detectContext(normalized, lang),
    role: detectRole(normalized, lang),
    objective: detectObjective(normalized, lang),
    format: detectFormat(normalized, lang),
    tone: detectTone(normalized, lang),
    constraints: detectConstraints(normalized, lang),
  };
}

function scoreTier(score: number, total: number, copy: LocalizedCopy) {
  if (score === total) return copy.quiz.tierPerfect;
  if (score >= total - 1) return copy.quiz.tierGreat;
  if (score >= Math.ceil(total / 2)) return copy.quiz.tierOk;
  return copy.quiz.tierLow;
}

export function PromptingFrameworkClient() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [lang, setLang] = useState<Lang>("en");
  const [rewriteInput, setRewriteInput] = useState(rewriteSamples.en);
  const [rewriteResult, setRewriteResult] = useState<PromptElements | null>(null);
  const [builder, setBuilder] = useState<PromptElements>(defaultBuilderValues.en);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(quizQuestions.en.length).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const bootedRef = useRef(false);

  const copy = localizedCopy[lang];
  const currentExamples = builderExampleSets[lang];
  const currentQuizzes = quizQuestions[lang];
  const currentDeepDives = deepDiveCards[lang];
  const fullPrompt = useMemo(() => makePrompt(builder, lang), [builder, lang]);
  const rewrittenPrompt = useMemo(
    () => (rewriteResult ? makePrompt(rewriteResult, lang) : ""),
    [rewriteResult, lang],
  );
  const quizScore = quizAnswers.reduce(
    (total, answer, index) => total + (answer === currentQuizzes[index].answer ? 1 : 0),
    0,
  );
  const quizTier = scoreTier(quizScore, currentQuizzes.length, copy);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const storedBuilder = window.localStorage.getItem("croftc-builder");
    const storedExample = window.localStorage.getItem("croftc-example");

    const frame = window.requestAnimationFrame(() => {
      setTheme(storedTheme === "light" ? "light" : "dark");
      setLang("en");

      if (storedBuilder) {
        try {
          setBuilder(JSON.parse(storedBuilder) as PromptElements);
        } catch {
          setBuilder(defaultBuilderValues.en);
        }
      }

      if (storedExample) {
        const parsed = Number.parseInt(storedExample, 10);
        if (!Number.isNaN(parsed)) setExampleIndex(parsed % currentExamples.length);
      }

      bootedRef.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentExamples.length]);

  useEffect(() => {
    if (!bootedRef.current) return;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem("croftc-builder", JSON.stringify(builder));
    window.localStorage.setItem("croftc-example", String(exampleIndex));
  }, [builder, exampleIndex, lang, theme]);

  useEffect(() => {
    const revealNodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  function updateTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function loadExample(index: number) {
    setExampleIndex(index);
    setBuilder(currentExamples[index].values);
  }

  async function sendRewrite() {
    const rewritten = rewritePrompt(rewriteInput, lang);
    setRewriteResult(rewritten);
  }

  return (
    <div className="croftc-shell" data-theme={theme} data-lang={lang}>
      <SiteTopbar theme={theme} onToggleTheme={updateTheme} activeItem="croftc" />

      <main className="croftc-main">
        <section
          id="hero"
          className="croftc-section croftc-hero"
          data-reveal
        >
          <div className="croftc-hero-copy">
            <p className="croftc-kicker">{copy.hero.kicker}</p>
            <h1>{copy.hero.title}</h1>
            <p className="croftc-subtitle">{copy.hero.subtitle}</p>
            <p className="croftc-body">{copy.hero.body}</p>
            <p className="croftc-note">{copy.hero.note}</p>
          </div>
          <div className="croftc-strip" aria-label="CROFTC letters">
            {letterMeta.map((letter) => {
              const letterCopy = copy.letters[letter.key];
              return (
                <article
                  key={letter.key}
                  className="croftc-letter"
                  style={{ ["--accent" as string]: letter.color }}
                >
                  <span>{letter.emoji}</span>
                  <strong>{letter.letter}</strong>
                  <h2>{letterCopy.title}</h2>
                  <p>{letterCopy.tagline}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="school"
          className="croftc-section croftc-school"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.school.title}</p>
            <h2>{copy.school.body}</h2>
          </div>
          <div className="croftc-school-grid">
            <article className="croftc-school-card">
              <span>{copy.school.classLabel}</span>
              <h3>{copy.school.classTitle}</h3>
              <p>{copy.school.classBody}</p>
              <strong>{copy.school.classStatus}</strong>
            </article>
            <article className="croftc-school-card">
              <span>{copy.school.moreLabel}</span>
              <h3>{copy.school.moreTitle}</h3>
              <p>{copy.school.moreBody}</p>
              <strong>{copy.school.note}</strong>
            </article>
          </div>
        </section>

        <section
          id="rewriter"
          className="croftc-section croftc-rewriter"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.rewriter.title}</p>
            <h2>{copy.rewriter.body}</h2>
          </div>
          <div className="croftc-rewriter-stack">
            <article className="croftc-panel">
              <label htmlFor="croftc-rewrite-input" className="croftc-label">
                {copy.rewriter.title}
              </label>
              <textarea
                id="croftc-rewrite-input"
                value={rewriteInput}
                onChange={(event) => setRewriteInput(event.target.value)}
                placeholder={copy.rewriter.placeholder}
              />
              <div className="croftc-actions">
                <button type="button" className="croftc-button primary" onClick={sendRewrite}>
                  {copy.rewriter.action}
                </button>
                <button
                  type="button"
                  className="croftc-button secondary"
                  onClick={() => loadExample(exampleIndex)}
                >
                  {copy.builder.randomize}
                </button>
              </div>
            </article>
            <article className="croftc-panel croftc-result">
              <label className="croftc-label">{copy.rewriter.result}</label>
              {rewriteResult ? (
                <div className="croftc-result-grid">
                  {letterMeta.map((letter) => (
                    <div
                      key={letter.key}
                      className="croftc-result-card"
                      style={{ ["--accent" as string]: letter.color }}
                    >
                      <span>{letter.key}</span>
                      <p>{rewriteResult[letter.key]}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="croftc-empty">{copy.rewriter.empty}</p>
              )}
              <div className="croftc-combined">
                <span>{copy.rewriter.combined}</span>
                <pre>{rewriteResult ? rewrittenPrompt : makePrompt(rewritePrompt(rewriteInput, lang), lang)}</pre>
              </div>
            </article>
          </div>
        </section>

        <section
          id="builder"
          className="croftc-section croftc-builder"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.builder.title}</p>
            <h2>{copy.builder.body}</h2>
          </div>
          <div className="croftc-builder-actions">
            {currentExamples.map((example, index) => (
              <button key={example.title} type="button" className="croftc-chip" onClick={() => loadExample(index)}>
                {example.title}
              </button>
            ))}
            <button
              type="button"
              className="croftc-chip primary"
              onClick={() => {
                const nextIndex = (exampleIndex + 1) % currentExamples.length;
                loadExample(nextIndex);
              }}
            >
              {copy.builder.randomize}
            </button>
          </div>
          <div className="croftc-builder-grid">
            {letterMeta.map((letter) => (
              <label key={letter.key} className="croftc-field" style={{ ["--accent" as string]: letter.color }}>
                <span>
                  {letter.letter} {copy.letters[letter.key].title}
                </span>
                <textarea
                  value={builder[letter.key]}
                  onChange={(event) =>
                    setBuilder((current) => ({ ...current, [letter.key]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <aside className="croftc-preview">
            <p className="croftc-label">{copy.builder.preview}</p>
            <pre>{fullPrompt}</pre>
          </aside>
        </section>

        <section
          id="deepdive"
          className="croftc-section croftc-deepdive"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.deepdive.title}</p>
            <h2>{copy.deepdive.body}</h2>
          </div>
          <div className="croftc-deep-grid">
            {currentDeepDives.map((card) => (
              <article
                key={card.key}
                className="croftc-deep-card"
                style={{ ["--accent" as string]: card.color }}
              >
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
              </article>
            ))}
          </div>
        </section>

        <section
          id="example"
          className="croftc-section croftc-example"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.example.title}</p>
            <h2>{copy.example.body}</h2>
          </div>
          <article className="croftc-example-shell">
            <div className="croftc-example-grid">
              {letterMeta.map((letter) => (
                <div key={letter.key} className="croftc-example-block" style={{ ["--accent" as string]: letter.color }}>
                  <span>{copy.letters[letter.key].title}</span>
                  <p>{fullExample[lang][letter.key]}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          id="quiz"
          className="croftc-section croftc-quiz"
          data-reveal
        >
          <div className="croftc-section-heading">
            <p className="croftc-kicker">{copy.quiz.title}</p>
            <h2>{copy.quiz.body}</h2>
          </div>
          <div className="croftc-quiz-grid">
            {currentQuizzes.map((item, questionIndex) => (
              <article key={item.question} className="croftc-quiz-card">
                <h3>{questionIndex + 1}. {item.question}</h3>
                <div className="croftc-quiz-options">
                  {item.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      className={quizAnswers[questionIndex] === optionIndex ? "is-selected" : ""}
                      onClick={() => {
                        setQuizAnswers((current) => {
                          const next = [...current];
                          next[questionIndex] = optionIndex;
                          return next;
                        });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {quizSubmitted ? (
                  <p className={quizAnswers[questionIndex] === item.answer ? "is-correct" : "is-wrong"}>
                    {item.explanation}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <div className="croftc-quiz-footer">
            <div className="croftc-quiz-score">
              <strong>
                {copy.quiz.scoreLabel}: {quizScore}/{currentQuizzes.length}
              </strong>
              <span>
                {copy.quiz.resultLabel} {quizTier}
              </span>
            </div>
            <div className="croftc-actions">
              <button type="button" className="croftc-button primary" onClick={() => setQuizSubmitted(true)}>
                {copy.quiz.submit}
              </button>
              <button
                type="button"
                className="croftc-button secondary"
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers(Array(currentQuizzes.length).fill(-1));
                }}
              >
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
              <Link className="croftc-button primary" href="/">
                {copy.teaser.action}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
