/**
 * Single source of truth for site content.
 * Every fact below comes from Afnan's real CV — no invented content.
 */

export const person = {
  name: "Afnan Hany Youssef",
  shortName: "Afnan Hany",
  email: "afnanhany18@gmail.com",
  phone: "+20 1557929312",
  location: "Cairo, Egypt",
  linkedin:
    "https://www.linkedin.com/in/afnan-hany-52a4a3340",
  roles: [
    "AI Engineer",
    "Machine Learning Engineer",
    "LLM Engineer",
    "AI Developer",
    "Software Engineer",
    "AI Product Builder",
    "Founder",
  ],
  intro:
    "I design and ship production AI systems — multi-agent orchestrators, RAG pipelines, and LLM products with real backends, real users, and real payments.",
  about: [
    "I'm an AI developer from Cairo who treats AI like a product discipline, not a demo. At IBM's AI internship I built LLM-powered chatbots, multimodal solutions with speech and bilingual English/Arabic OCR, and MCP-based pipelines that automate agent workflows.",
    "My graduation project, Bizify — an AI-powered startup development platform — ranked Top 4 among graduation projects at Helwan National University, where I'm completing my B.I.D.T major with a 3.79 GPA (Excellent).",
    "Before AI, I built full-stack foundations: a .NET web development scholarship at the Digital Egypt Pioneers Initiative, Flutter training at ITI, and an IT internship at TAQA Arabia automating data migration into SAP. I've also taught software engineering and algorithms at the Digital Egypt Cubs Initiative.",
  ],
  stats: [
    { value: "3.79", label: "GPA — Excellent" },
    { value: "Top 4", label: "Graduation project rank" },
    { value: "3", label: "AI products shipped" },
    { value: "2", label: "Internships (IBM, TAQA)" },
  ],
} as const;

export type Mode = "recruiter" | "freelancer" | "founder";

export const modes: Record<Mode, { label: string; emoji: string; pitch: string; highlights: string[] }> = {
  recruiter: {
    label: "Recruiter",
    emoji: "🧑‍💼",
    pitch:
      "Production AI experience at IBM, a Top-4 ranked AI platform shipped end-to-end, and a 3.79 GPA. I ramp fast and deliver systems, not notebooks.",
    highlights: ["experience", "skills", "certificates", "education"],
  },
  freelancer: {
    label: "Freelance Client",
    emoji: "🤝",
    pitch:
      "I build AI chatbots, RAG systems, automations, and FastAPI backends that go live — with payments, auth, and monitoring included.",
    highlights: ["services", "projects", "contact"],
  },
  founder: {
    label: "Startup Founder",
    emoji: "🚀",
    pitch:
      "I've built a startup-development platform myself — idea validation, market research, unit economics. I know what an MVP needs and how to ship it with AI.",
    highlights: ["projects", "services", "about"],
  },
};

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  period: string;
  description: string;
  problem: string;
  solution: string;
  architecture: string[];
  tech: string[];
  metrics: { label: string; value: string }[];
  lessons: string[];
  links: { github?: string; demo?: string };
  accent: string;
}

export const projects: Project[] = [
  {
    slug: "bizify",
    title: "Bizify",
    tagline: "AI-Powered Startup Development Platform",
    period: "2025 – 2026",
    description:
      "Graduation project at Helwan National University (BIDT program), ranked Top 4. Bizify helps entrepreneurs generate, validate, and execute startup ideas with AI-assisted market research, competitor analysis, supplier discovery, business planning, roadmap tracking, and real-time insights.",
    problem:
      "First-time founders drown in scattered advice: validating an idea means weeks of manual market research, competitor spreadsheets, and guesswork on unit economics.",
    solution:
      "One AI platform that turns a raw idea into a validated, structured startup plan — market potential, competition, customers, business model, MVP planning, unit economics, and go-to-market — every section streamed live and regenerable through AI chat.",
    architecture: [
      "React.js frontend with SSE streaming for live AI generation",
      "FastAPI backend, SQLAlchemy + PostgreSQL, Redis caching",
      "OpenAI SDK generation with strict per-section schemas",
      "JWT/OAuth authentication, PayPal + Paymob payments",
    ],
    tech: ["React.js", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT/OAuth", "SSE", "PayPal", "Paymob", "OpenAI SDK"],
    metrics: [
      { label: "Graduation rank", value: "Top 4" },
      { label: "AI plan sections", value: "9+" },
      { label: "Payment providers", value: "2" },
    ],
    lessons: [
      "SSE streaming transforms perceived AI latency — users tolerate long generations when they watch progress.",
      "Structured AI output needs strict schemas and regeneration paths, not free-form text.",
      "Payment integration teaches defensive engineering: idempotent webhooks and reconciliation.",
    ],
    links: {},
    accent: "#8b5cf6",
  },
  {
    slug: "fentech",
    title: "FenTech",
    tagline: "Intelligent Financial Management Assistant",
    period: "2025 · IBM AI",
    description:
      "Built during the IBM AI internship: an AI assistant that helps users track expenses, manage budgets, create savings plans, and receive personalized investment guidance.",
    problem:
      "Personal finance tools show numbers but don't reason about them — users still translate charts into decisions alone.",
    solution:
      "A multi-agent system where specialized agents collaborate on budgeting, savings, and investment guidance over real-time WebSocket conversations.",
    architecture: [
      "AutoGen (AG2) multi-agent orchestration over Azure OpenAI",
      "MCP-based tool access keeps agents decoupled from integrations",
      "FastAPI backend with WebSocket streaming conversations",
    ],
    tech: ["FastAPI", "AutoGen (AG2)", "Azure OpenAI", "MCP", "WebSockets"],
    metrics: [
      { label: "Agent framework", value: "AutoGen AG2" },
      { label: "Transport", value: "WebSockets" },
    ],
    lessons: [
      "Multi-agent orchestration needs explicit hand-off protocols or agents talk past each other.",
      "MCP standardizes tool access so agents stay decoupled from integrations.",
    ],
    links: {},
    accent: "#22d3ee",
  },
  {
    slug: "exo-scan-ai",
    title: "Exo Scan AI",
    tagline: "Exoplanet Classification · NASA Space Apps 2025",
    period: "2025 · NASA",
    description:
      "A RandomForest-based ML pipeline classifying exoplanet signals from NASA's Kepler dataset into confirmed planets, candidates, and false positives — optimized for minority-class recall.",
    problem:
      "Kepler produces far more candidate signals than astronomers can vet manually, and the interesting classes are heavily under-represented.",
    solution:
      "A scikit-learn pipeline with Pandas/NumPy feature engineering and a RandomForest tuned for minority-class recall, so real planets aren't lost to class imbalance.",
    architecture: [
      "Pandas/NumPy feature engineering over Kepler light-curve data",
      "RandomForest with class-imbalance-aware tuning",
      "Evaluation centered on minority-class recall, not accuracy",
    ],
    tech: ["Python", "Scikit-learn", "Pandas", "NumPy", "RandomForest"],
    metrics: [
      { label: "Classes", value: "3" },
      { label: "Optimized for", value: "Minority recall" },
    ],
    lessons: [
      "On imbalanced scientific data, accuracy is a vanity metric — recall on the rare class is what matters.",
    ],
    links: {},
    accent: "#fb7185",
  },
];

export const timeline = [
  { year: "2022", title: "Helwan National University", detail: "Started B.I.D.T major — Humanities, Commerce & Business Administration.", kind: "education" },
  { year: "2023", title: "TAQA Arabia — IT Intern", detail: "Automated browser workflows and streamlined Excel → SAP data migration.", kind: "work" },
  { year: "2024", title: "DEPI — .NET Scholarship", detail: "Digital Egypt Pioneers Initiative, .NET Web Development track.", kind: "education" },
  { year: "2024", title: "DECI — Instructor Assistant", detail: "Taught software engineering, algorithms, and problem-solving.", kind: "work" },
  { year: "2025", title: "IBM — AI Internship", detail: "LLM chatbots, bilingual OCR, MCP pipelines, AI orchestrators, FenTech.", kind: "work" },
  { year: "2025", title: "ITI — Flutter Track", detail: "Cross-platform mobile development training.", kind: "education" },
  { year: "2025", title: "NASA Space Apps Challenge", detail: "Built Exo Scan AI — exoplanet classification on Kepler data.", kind: "award" },
  { year: "2026", title: "Bizify — Top 4 Graduation Project", detail: "AI-powered startup development platform, GPA 3.79 (Excellent).", kind: "award" },
] as const;

export const experience = [
  {
    org: "IBM",
    role: "AI Intern",
    period: "07/2025 – 09/2025",
    bullets: [
      "Developed LLM-powered chatbots and multimodal AI supporting speech, text, and bilingual OCR (English/Arabic).",
      "Built AI orchestrators and MCP-based pipelines automating agent workflows — improving efficiency and response accuracy.",
      "Conducted market research and competitor analysis; presented AI business value to stakeholders.",
      "Built responsive Flutter UI features integrated with backend APIs.",
    ],
  },
  {
    org: "Digital Egypt Cubs Initiative",
    role: "Software Programming Instructor Assistant",
    period: "12/2024 – 06/2025",
    bullets: ["Taught software engineering, algorithms, problem-solving, and soft skills."],
  },
  {
    org: "TAQA Arabia",
    role: "IT Intern",
    period: "07/2023 – 09/2023",
    bullets: [
      "Automated daily browser tasks with scripts to download and organize information.",
      "Streamlined data migration from Excel to SAP, improving accuracy.",
    ],
  },
] as const;

export const aiSkills = [
  { name: "LLM Applications & RAG", level: 92, items: ["OpenAI Agents SDK", "LangChain", "LangGraph"] },
  { name: "Agent Orchestration", level: 90, items: ["AutoGen (AG2)", "MCP", "AI Orchestration"] },
  { name: "Machine Learning", level: 85, items: ["Scikit-learn", "PyTorch", "Data Pipelines"] },
  { name: "NLP & Multimodal", level: 84, items: ["NLP", "OCR (EN/AR)", "Hugging Face"] },
  { name: "Deep Learning", level: 78, items: ["CNNs", "RNNs", "GANs"] },
] as const;

export const softwareSkills = [
  { group: "Backend", items: ["FastAPI", "Flask", "ASP.NET MVC", "Express.js", "Spring Boot", "Node.js"] },
  { group: "Languages", items: ["Python", "C#", "C++", "Java", "JavaScript", "Dart"] },
  { group: "Databases", items: ["PostgreSQL", "SQL Server", "MySQL", "MongoDB", "Redis"] },
  { group: "Mobile & UI", items: ["Flutter", "Figma", "HTML/CSS"] },
  { group: "DevOps & APIs", items: ["Docker", "Railway", "REST", "Postman", "Swagger"] },
  { group: "Quality & Security", items: ["Jest", "TDD", "JWT", "SSL/TLS", "CORS", "Power Automate"] },
] as const;

export const certificates = [
  { title: "NASA Space Apps Challenge", issuer: "NASA", year: "2025" },
  { title: "Machine Learning with Python (V2)", issuer: "IBM", year: "2025" },
  { title: "Generative AI and LLMs", issuer: "Coursera / IBM track", year: "2025" },
  { title: "Computer Vision", issuer: "Certificate", year: "2025" },
  { title: "AI Fundamentals", issuer: "Certificate", year: "2024" },
  { title: "MLOps Concepts", issuer: "Certificate", year: "2025" },
  { title: "AWS AI Practitioner", issuer: "AWS — expected Aug 2026", year: "2026" },
] as const;

export const services = [
  { icon: "🤖", title: "AI Chatbots", desc: "RAG-grounded assistants that answer from your data — and never hallucinate." },
  { icon: "🧠", title: "LLM Applications", desc: "Production LLM features: structured output, streaming, evals, cost control." },
  { icon: "🕸️", title: "Agent Systems", desc: "Multi-agent orchestration with AutoGen, LangGraph, and MCP tool pipelines." },
  { icon: "⚡", title: "FastAPI Backends", desc: "Typed, tested, documented APIs with PostgreSQL, Redis, and JWT auth." },
  { icon: "📈", title: "Machine Learning", desc: "From feature engineering to deployed models — tuned for the metric that matters." },
  { icon: "👁️", title: "Computer Vision & OCR", desc: "Bilingual English/Arabic OCR and vision pipelines, proven at IBM." },
  { icon: "🔁", title: "Automation", desc: "Workflow automation from browser scripts to Power Automate to AI agents." },
  { icon: "🚀", title: "AI MVP Development", desc: "Idea → validated, deployed AI product. I built Bizify; I'll build yours." },
] as const;

export const blogPosts = [
  {
    slug: "building-bizify-ai-startup-platform",
    title: "Building Bizify: what shipping a real AI product taught me",
    excerpt:
      "Nine AI-generated plan sections, SSE streaming, two payment providers, and a Top 4 rank — the engineering lessons behind Bizify.",
    date: "2026-06-01",
    readingMinutes: 6,
    sections: [
      {
        heading: "1. Streaming is a product feature, not a transport detail",
        body: "Founders asked Bizify for market analyses that take 30–60 seconds to generate. With a spinner, that feels broken. With SSE token streaming, the same latency feels alive. We stream every AI section — market potential, competition, customers, business model, unit economics, go-to-market — and regeneration became something users enjoy watching.",
      },
      {
        heading: "2. Structured output needs contracts",
        body: "Free-form LLM text doesn't survive a UI. Every Bizify section has a strict schema the model must fill, validated server-side in FastAPI before it ever reaches React. When validation fails, we regenerate with the error in context. Reliability went from demo-grade to production-grade.",
      },
      {
        heading: "3. Payments teach you defensive engineering",
        body: "Integrating PayPal and Paymob forced idempotent webhook handlers, signature verification, and reconciliation jobs. AI code can be regenerated; money bugs cannot. Bizify ranked Top 4 among graduation projects — but the real outcome is this playbook, which I now apply to every AI system I build.",
      },
    ],
  },
] as const;

export const sections = [
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "certificates", label: "Certificates" },
  { id: "services", label: "Services" },
  { id: "blog", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;
