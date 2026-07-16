/**
 * Single source of truth for site content.
 * Every fact below comes from Afnan's real CV. No invented content.
 */

export const person = {
  name: "Afnan Hany Youssef",
  shortName: "Afnan Hany",
  email: "afnanhany18@gmail.com",
  phone: "+20 1557929312",
  location: "Cairo, Egypt",
  linkedin: "https://www.linkedin.com/in/afnan-hany-52a4a3340",
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
    "I design and ship production AI systems: multi-agent orchestrators, RAG pipelines, and LLM products with real backends, real users, and real payments.",
  about: [
    "I'm an AI developer from Cairo who treats AI like a product discipline, not a demo. At IBM's AI internship I built LLM-powered chatbots, multimodal solutions with speech and bilingual English/Arabic OCR, and MCP-based pipelines that automate agent workflows.",
    "My graduation project, Bizify, an AI-powered startup development platform, ranked Top 4 among graduation projects at Helwan National University, where I'm completing my B.I.D.T major with a 3.79 GPA (Excellent), ranked 14th in my class (top 3%).",
    "Before AI, I built full-stack foundations: a .NET web development scholarship at the Digital Egypt Pioneers Initiative, Flutter training at ITI, and an IT internship at TAQA Arabia automating data migration into SAP. I've also taught software engineering and algorithms at the Digital Egypt Cubs Initiative.",
  ],
  stats: [
    { value: "3.79", label: "GPA (Excellent)" },
    { value: "14th", label: "Class rank (top 3%)" },
    { value: "Top 4", label: "Graduation rank" },
    { value: "3", label: "AI products shipped" },
    { value: "2", label: "Internships (IBM, TAQA)" },
  ],
} as const;

export type Mode = "recruiter" | "freelancer" | "founder";

export const modes: Record<Mode, { label: string; pitch: string; highlights: string[] }> = {
  recruiter: {
    label: "Recruiter",
    pitch:
      "Production AI experience at IBM, a Top 4 ranked AI platform shipped end to end, and a 3.79 GPA. I ramp fast and deliver systems, not notebooks.",
    highlights: ["experience", "skills", "certificates", "education"],
  },
  freelancer: {
    label: "Freelance Client",
    pitch:
      "I build AI chatbots, RAG systems, automations, and FastAPI backends that go live, with payments, auth, and monitoring included.",
    highlights: ["services", "projects", "contact"],
  },
  founder: {
    label: "Startup Founder",
    pitch:
      "I've built a startup development platform myself, covering idea validation, market research, and unit economics. I know what an MVP needs and how to ship it with AI.",
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
  links: { github?: string; demo?: string; video?: string };
  accent: string;
}

export const projects: Project[] = [
  {
    slug: "bizify",
    title: "Bizify",
    tagline: "AI-Powered Startup Development Platform",
    period: "2025 to 2026",
    description:
      "Graduation project at Helwan National University (BIDT program), ranked Top 4. Bizify helps entrepreneurs generate, validate, and execute startup ideas with AI-assisted market research, competitor analysis, supplier discovery, business planning, roadmap tracking, and real-time insights, in a bilingual Arabic/English interface.",
    problem:
      "First-time founders drown in scattered advice. Validating an idea means weeks of manual market research, competitor spreadsheets, and guesswork on unit economics.",
    solution:
      "One AI platform that turns a raw idea into a validated, structured startup plan covering market potential, competition, customers, business model, MVP planning, unit economics, and go-to-market. Every section is streamed live and regenerable through AI chat.",
    architecture: [
      "React.js frontend with SSE streaming for live AI generation",
      "FastAPI backend, SQLAlchemy with PostgreSQL, Redis caching",
      "OpenAI SDK generation with strict per-section schemas",
      "JWT/OAuth authentication, PayPal and Paymob payments",
    ],
    tech: ["React.js", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT/OAuth", "SSE", "PayPal", "Paymob", "OpenAI SDK"],
    metrics: [
      { label: "Graduation rank", value: "Top 4" },
      { label: "AI plan sections", value: "9+" },
      { label: "Payment providers", value: "2" },
      { label: "Languages", value: "AR / EN" },
    ],
    lessons: [
      "SSE streaming transforms perceived AI latency. Users tolerate long generations when they watch progress.",
      "Structured AI output needs strict schemas and regeneration paths, not free-form text.",
      "Payment integration teaches defensive engineering: idempotent webhooks and reconciliation.",
    ],
    links: { demo: "https://bizify-v2.vercel.app/", video: "https://youtu.be/sgl-jmdl4U4" },
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
      "Personal finance tools show numbers but don't reason about them. Users still translate charts into decisions alone.",
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
      "A RandomForest-based ML pipeline classifying exoplanet signals from NASA's Kepler dataset into confirmed planets, candidates, and false positives, optimized for minority-class recall.",
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
      "On imbalanced scientific data, accuracy is a vanity metric. Recall on the rare class is what matters.",
    ],
    links: {},
    accent: "#fb7185",
  },
  {
    slug: "bookish",
    title: "Bookish",
    tagline: "Bilingual Library Management System · ASP.NET Core",
    period: "2024 to 2025",
    description:
      "A clean 4-layer rewrite of a DEPI library monolith, rehabilitated from an abandoned skeleton into a deployable ASP.NET Core 8 app: a REST API with an MVC front-end, migrated from SQL Server to PostgreSQL, secured, containerized, and shipped as an 'Antiquarian' vintage bilingual (Arabic/English) library platform.",
    problem:
      "The inherited codebase compiled but didn't run: only ~2 of 6 features were wired end to end, sessions and auth were commented out, login methods threw NotImplementedException, and plaintext secrets pointed at dead SQL Server credentials.",
    solution:
      "A 7-phase rehabilitation: fix the runtime blockers, migrate SQL Server to PostgreSQL, build full API and frontend parity, hash passwords with ASP.NET Identity, containerize with Docker, and redesign into a bilingual library with borrow/buy flows, an admin panel, and EGP pricing, deployed to Railway.",
    architecture: [
      "4-layer solution: API, BLL (domain + DTOs), DAL (EF Core, Repository/UnitOfWork), MVC UI",
      "MVC front-end is a pure API consumer over a typed HttpClient (System.Net.Http.Json)",
      "PostgreSQL via Npgsql, with EF migrations run on API startup",
      "Cookie-based localization (Localizer + CultureController) with RTL Arabic support",
      "Dockerized API and UI, deployed to Railway alongside Postgres",
    ],
    tech: ["ASP.NET Core 8", "C#", "EF Core", "PostgreSQL", "Npgsql", "Docker", "Railway", "ASP.NET Identity", "MVC", "REST API"],
    metrics: [
      { label: "Architecture", value: "4-layer" },
      { label: "New API controllers", value: "10" },
      { label: "Languages", value: "AR / EN" },
    ],
    lessons: [
      "Reviving abandoned code is about runtime wiring, not compile errors: sessions, routes, and unimplemented methods.",
      "Migrating SQL Server to PostgreSQL is easiest when the UI is a pure API consumer with no DbContext of its own.",
      "Legacy plaintext passwords can auto-upgrade to hashes on the first successful login.",
    ],
    links: { demo: "https://vivacious-trust-production-dfa4.up.railway.app/" },
    accent: "#d9a34a",
  },
];

export const timeline = [
  {
    year: "2022",
    title: "Helwan National University",
    detail:
      "Started the B.I.D.T major (Business Information & Digital Transformation) within Humanities, Commerce & Business Administration. Built core computer science foundations: OOP, data structures, algorithms, and databases, alongside business and market analysis skills that later shaped how I design AI products.",
    kind: "education",
    tags: ["OOP", "Data Structures", "SQL"],
  },
  {
    year: "2023",
    title: "TAQA Arabia, IT Intern",
    detail:
      "First industry experience. Wrote scripts that automated daily browser tasks for downloading and organizing information, and streamlined the migration of operational data from Excel into SAP, reducing manual entry and improving accuracy for the IT team.",
    kind: "work",
    tags: ["Automation", "SAP", "Excel"],
  },
  {
    year: "2024",
    title: "DEPI, .NET Scholarship",
    detail:
      "Selected for the Digital Egypt Pioneers Initiative scholarship (April to December 2024). Trained full-stack web development on the Microsoft stack: C#, ASP.NET MVC, SQL Server, REST API design, and testing fundamentals. My project was a Library management system (ASP.NET Core 8 MVC, EF Core, SQL Server) covering members, books, checkouts, orders, and penalties, which I later re-architected into the layered Bookish platform.",
    kind: "education",
    tags: ["C#", "ASP.NET MVC", "SQL Server", "EF Core"],
    links: [
      { label: "DEPI-Project (Library) on GitHub", href: "https://github.com/Afnan-Hany/DEPI-Project.git" },
    ],
  },
  {
    year: "2024",
    title: "DECI, Instructor Assistant",
    detail:
      "Taught software engineering, algorithms, problem-solving, and soft skills at the Digital Egypt Cubs Initiative (December 2024 to June 2025). Explaining recursion to beginners is the best test of whether you truly understand it. Sharpened mentoring and communication skills I now use with clients and stakeholders.",
    kind: "work",
    tags: ["Teaching", "Algorithms", "Communication"],
  },
  {
    year: "2025",
    title: "IBM, AI Internship",
    detail:
      "The turning point (July to September 2025). Built LLM-powered chatbots and multimodal AI supporting speech, text, and bilingual English/Arabic OCR. Designed AI orchestrators and MCP-based pipelines that automate agent workflows, improving efficiency and response accuracy. Shipped FenTech, a multi-agent financial assistant on AutoGen and Azure OpenAI, and presented AI business value to stakeholders.",
    kind: "work",
    tags: ["LLM", "OCR", "MCP", "AutoGen", "Azure OpenAI"],
  },
  {
    year: "2025",
    title: "ITI, Flutter Track",
    detail:
      "Intensive cross-platform mobile development training (August to September 2025). Built responsive Flutter UIs in Dart and integrated them with backend APIs, the same skills I applied to mobile features during the IBM internship.",
    kind: "education",
    tags: ["Flutter", "Dart", "REST APIs"],
  },
  {
    year: "2025",
    title: "NASA Space Apps Challenge",
    detail:
      "Built Exo Scan AI: a RandomForest machine learning pipeline that classifies exoplanet signals from NASA's Kepler dataset into confirmed planets, candidates, and false positives. Engineered features with Pandas and NumPy and tuned the model for minority-class recall so rare true planets aren't lost to class imbalance.",
    kind: "award",
    tags: ["Python", "Scikit-learn", "RandomForest"],
  },
  {
    year: "2026",
    title: "Bizify, Top 4 Graduation Project",
    detail:
      "Led the AI platform that helps entrepreneurs generate, validate, and execute startup ideas: market research, competitor analysis, supplier discovery, business planning, and real-time insights, in a bilingual Arabic/English interface. React, FastAPI, PostgreSQL, Redis, and the OpenAI SDK, with PayPal and Paymob payments. Ranked Top 4 among graduation projects. Graduating with a 3.79 GPA, grade Excellent, ranked 14th in my class (top 3%).",
    kind: "award",
    tags: ["FastAPI", "React", "OpenAI SDK", "Payments"],
    links: [
      { label: "Bizify live site", href: "https://bizify-v2.vercel.app/" },
      { label: "Project video", href: "https://youtu.be/sgl-jmdl4U4" },
    ],
  },
] as const;

export const experience = [
  {
    org: "IBM",
    role: "AI Intern",
    period: "07/2025 to 09/2025",
    bullets: [
      "Developed LLM-powered chatbots and multimodal AI supporting speech, text, and bilingual OCR (English/Arabic).",
      "Built AI orchestrators and MCP-based pipelines automating agent workflows, improving efficiency and response accuracy.",
      "Conducted market research and competitor analysis; presented AI business value to stakeholders.",
      "Built responsive Flutter UI features integrated with backend APIs.",
    ],
  },
  {
    org: "Digital Egypt Cubs Initiative",
    role: "Software Programming Instructor Assistant",
    period: "12/2024 to 06/2025",
    bullets: ["Taught software engineering, algorithms, problem-solving, and soft skills."],
  },
  {
    org: "TAQA Arabia",
    role: "IT Intern",
    period: "07/2023 to 09/2023",
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

/** `url` is the public verification page for the certificate, taken from the CV. */
export const certificates: {
  title: string;
  issuer: string;
  year: string;
  url?: string;
}[] = [
  {
    title: "NASA Space Apps Challenge",
    issuer: "NASA",
    year: "2025",
    url: "https://drive.google.com/file/d/1Eh8DC1C-JFIUb_0kLkvC5kKwq9NdMkrm/view?usp=drivesdk",
  },
  {
    title: "Machine Learning with Python (V2)",
    issuer: "IBM",
    year: "2025",
    url: "https://www.credly.com/badges/ac3e8e41-dae6-45fc-ba3d-e53531cc41f3/linked_in_profile",
  },
  {
    title: "Generative AI and LLMs",
    issuer: "IBM track",
    year: "2025",
    url: "https://www.coursera.org/account/accomplishments/verify/CC1G1DK50Z70",
  },
  { title: "Computer Vision", issuer: "Certificate", year: "2025" },
  {
    title: "AI Fundamentals",
    issuer: "Certificate",
    year: "2024",
    url: "https://www.credly.com/badges/25ac5bb8-00d5-4bef-95ab-21cc0ef22c27/linked_in_profile",
  },
  { title: "MLOps Concepts", issuer: "Certificate", year: "2025" },
  { title: "AWS AI Practitioner", issuer: "AWS, expected Aug 2026", year: "2026" },
];

export const services = [
  { title: "AI Chatbots", desc: "RAG-grounded assistants that answer from your data and never hallucinate." },
  { title: "LLM Applications", desc: "Production LLM features: structured output, streaming, evals, cost control." },
  { title: "Agent Systems", desc: "Multi-agent orchestration with AutoGen, LangGraph, and MCP tool pipelines." },
  { title: "FastAPI Backends", desc: "Typed, tested, documented APIs with PostgreSQL, Redis, and JWT auth." },
  { title: "Machine Learning", desc: "From feature engineering to deployed models, tuned for the metric that matters." },
  { title: "Computer Vision & OCR", desc: "Bilingual English/Arabic OCR and vision pipelines, proven at IBM." },
  { title: "Automation", desc: "Workflow automation from browser scripts to Power Automate to AI agents." },
  { title: "AI MVP Development", desc: "Idea to validated, deployed AI product. I built Bizify; I'll build yours." },
] as const;

export const blogPosts = [
  {
    slug: "building-bizify-ai-startup-platform",
    title: "Building Bizify: what shipping a real AI product taught me",
    excerpt:
      "Nine AI-generated plan sections, SSE streaming, two payment providers, and a Top 4 graduation rank. These are the engineering lessons behind Bizify.",
    date: "2026-06-01",
    readingMinutes: 6,
    sections: [
      {
        heading: "1. Streaming is a product feature, not a transport detail",
        body: "Founders asked Bizify for market analyses that take 30 to 60 seconds to generate. With a spinner, that feels broken. With SSE token streaming, the same latency feels alive. We stream every AI section, from market potential to go-to-market, and regeneration became something users enjoy watching.",
      },
      {
        heading: "2. Structured output needs contracts",
        body: "Free-form LLM text doesn't survive a UI. Every Bizify section has a strict schema the model must fill, validated server-side in FastAPI before it ever reaches React. When validation fails, we regenerate with the error in context. Reliability went from demo-grade to production-grade.",
      },
      {
        heading: "3. Payments teach you defensive engineering",
        body: "Integrating PayPal and Paymob forced idempotent webhook handlers, signature verification, and reconciliation jobs. AI code can be regenerated; money bugs cannot. Bizify ranked Top 4 among graduation projects, but the real outcome is this playbook, which I now apply to every AI system I build.",
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
