"""First-run seeding: admin user, structured content, and the RAG knowledge base.

Every fact here comes from Afnan's real CV — no invented content.
Idempotent: runs only when the corresponding tables are empty.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models import BlogPost, Certificate, Experience, Project, User
from app.models import KnowledgeDocument
from app.services import rag

logger = logging.getLogger(__name__)

# Deep Bizify knowledge (README + sequence diagrams), generated into a committed
# JSON asset. Marked with this source_type so it can be re-ingested idempotently.
BIZIFY_KB_PATH = Path(__file__).parent / "data" / "bizify_knowledge.json"
BIZIFY_KB_SOURCE_TYPE = "bizify_deep"


PROJECTS = [
    {
        "slug": "bizify",
        "title": "Bizify — AI-Powered Startup Development Platform",
        "tagline": "From raw idea to executable startup plan, with AI at every step.",
        "period": "2025 – 2026",
        "featured": True,
        "sort_order": 0,
        "description": (
            "Graduation project at Helwan National University (BIDT program), ranked Top 4 among "
            "graduation projects. Bizify helps entrepreneurs generate, validate, and execute startup "
            "ideas through AI-assisted market research, competitor analysis, supplier discovery, "
            "business planning, roadmap tracking, and real-time business insights."
        ),
        "problem": (
            "First-time founders drown in scattered advice: validating an idea means weeks of manual "
            "market research, competitor spreadsheets, and guesswork on unit economics."
        ),
        "solution": (
            "A single AI platform that takes a raw idea and produces a validated, structured startup "
            "plan — market potential, competition, customers, business model, MVP planning, unit "
            "economics, and go-to-market — each section regenerable and refinable through streaming "
            "AI chat."
        ),
        "tech": ["React.js", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis", "JWT/OAuth", "SSE", "PayPal API", "Paymob", "OpenAI SDK"],
        "metrics": [
            {"label": "Graduation project rank", "value": "Top 4"},
            {"label": "AI-generated plan sections", "value": "9+"},
            {"label": "Payment providers integrated", "value": "2"},
        ],
        "lessons": [
            "Streaming (SSE) transforms perceived AI latency — users tolerate long generations when they see progress.",
            "Structured AI output needs strict schemas and regeneration paths, not free-form text.",
            "Payment integration (PayPal + Paymob) taught defensive webhook handling early.",
        ],
        "links": {"demo": "https://bizify-v2.vercel.app/"},
    },
    {
        "slug": "fentech",
        "title": "FenTech — Intelligent Financial Management Assistant",
        "tagline": "A multi-agent AI that manages budgets like a personal CFO.",
        "period": "2025 (IBM AI Internship)",
        "featured": True,
        "sort_order": 1,
        "description": (
            "Built during the IBM AI internship: an AI assistant that helps users track expenses, "
            "manage budgets, create savings plans, and receive personalized investment guidance."
        ),
        "problem": (
            "Personal finance tools show numbers but don't reason about them — users still have to "
            "translate charts into decisions."
        ),
        "solution": (
            "A multi-agent system (AutoGen/AG2) over Azure OpenAI with MCP-based tools and real-time "
            "WebSocket conversations, so specialized agents collaborate on budgeting, savings, and "
            "investment guidance."
        ),
        "tech": ["FastAPI", "AutoGen (AG2)", "Azure OpenAI", "MCP", "WebSockets"],
        "metrics": [
            {"label": "Agent framework", "value": "AutoGen AG2"},
            {"label": "Transport", "value": "Real-time WebSockets"},
        ],
        "lessons": [
            "Multi-agent orchestration needs explicit hand-off protocols or agents talk past each other.",
            "MCP standardizes tool access so agents stay decoupled from integrations.",
        ],
        "links": {},
    },
    {
        "slug": "exo-scan-ai",
        "title": "Exo Scan AI — Exoplanet Classification",
        "tagline": "Finding planets in NASA's Kepler data with ML.",
        "period": "2025 (NASA Space Apps Challenge)",
        "featured": True,
        "sort_order": 2,
        "description": (
            "NASA Space Apps Challenge 2025 project: a RandomForest-based ML pipeline that classifies "
            "exoplanet signals from NASA's Kepler dataset into confirmed planets, candidates, and "
            "false positives, with optimized minority-class recall."
        ),
        "problem": (
            "Kepler produces far more candidate signals than astronomers can vet manually, and the "
            "interesting classes are heavily under-represented."
        ),
        "solution": (
            "A scikit-learn pipeline (Pandas/NumPy feature engineering + RandomForest) tuned "
            "specifically for minority-class recall so real planets aren't lost to class imbalance."
        ),
        "tech": ["Python", "Scikit-learn", "Pandas", "NumPy", "RandomForest"],
        "metrics": [
            {"label": "Classes", "value": "3 (confirmed / candidate / false positive)"},
            {"label": "Optimization target", "value": "Minority-class recall"},
        ],
        "lessons": [
            "On imbalanced scientific data, accuracy is a vanity metric — recall on the rare class is what matters.",
        ],
        "links": {},
    },
    {
        "slug": "bookish",
        "title": "Bookish — Bilingual Library Management System",
        "tagline": "An abandoned .NET skeleton rehabilitated into a deployable, bilingual library.",
        "period": "2024 – 2025",
        "featured": True,
        "sort_order": 3,
        "description": (
            "A clean 4-layer rewrite of a DEPI library monolith, rehabilitated from an abandoned "
            "skeleton into a deployable ASP.NET Core 8 app: a REST API with an MVC front-end, migrated "
            "from SQL Server to PostgreSQL, secured, containerized, and shipped as an 'Antiquarian' "
            "vintage bilingual (Arabic/English) library platform."
        ),
        "problem": (
            "The inherited codebase compiled but didn't run: only ~2 of 6 features were wired end to "
            "end, sessions and auth were commented out, login methods threw NotImplementedException, "
            "and plaintext secrets pointed at dead SQL Server credentials."
        ),
        "solution": (
            "A 7-phase rehabilitation: fix the runtime blockers, migrate SQL Server to PostgreSQL, "
            "build full API and frontend parity, hash passwords with ASP.NET Identity, containerize "
            "with Docker, and redesign into a bilingual library with borrow/buy flows, an admin panel, "
            "and EGP pricing, deployed to Railway."
        ),
        "tech": ["ASP.NET Core 8", "C#", "EF Core", "PostgreSQL", "Npgsql", "Docker", "Railway", "ASP.NET Identity", "MVC", "REST API"],
        "metrics": [
            {"label": "Architecture", "value": "4-layer"},
            {"label": "New API controllers", "value": "10"},
            {"label": "Languages", "value": "Arabic / English"},
        ],
        "lessons": [
            "Reviving abandoned code is about runtime wiring, not compile errors — sessions, routes, unimplemented methods.",
            "Migrating SQL Server to PostgreSQL is easiest when the UI is a pure API consumer with no DbContext of its own.",
            "Legacy plaintext passwords can auto-upgrade to hashes on the first successful login.",
        ],
        "links": {"demo": "https://vivacious-trust-production-dfa4.up.railway.app/"},
    },
]

EXPERIENCE = [
    {
        "org": "IBM",
        "role": "AI Intern",
        "kind": "internship",
        "start": "07/2025",
        "end": "09/2025",
        "sort_order": 0,
        "bullets": [
            "Developed LLM-powered chatbots and multimodal AI solutions supporting speech, text, and bilingual OCR (English/Arabic).",
            "Built AI orchestrators and MCP-based pipelines to automate agent workflows, improving operational efficiency and response accuracy.",
            "Conducted market research and competitor analysis to support data-driven decisions; designed presentations communicating AI business value to stakeholders.",
            "Developed responsive Flutter mobile UI features and integrated backend APIs for dynamic, scalable functionality.",
        ],
    },
    {
        "org": "Digital Egypt Cubs Initiative (DECI)",
        "role": "Software Programming Instructor Assistant",
        "kind": "work",
        "start": "12/2024",
        "end": "06/2025",
        "sort_order": 1,
        "bullets": [
            "Taught software engineering, algorithms, problem-solving, and soft skills to young students.",
        ],
    },
    {
        "org": "TAQA Arabia",
        "role": "IT Intern",
        "kind": "internship",
        "start": "07/2023",
        "end": "09/2023",
        "sort_order": 2,
        "bullets": [
            "Automated daily browser tasks with scripts to download and organize information.",
            "Streamlined data migration from Excel to SAP, improving accuracy.",
        ],
    },
    {
        "org": "Helwan National University",
        "role": "B.A. Humanities, Commerce & Business Admin — Major: B.I.D.T",
        "kind": "education",
        "start": "09/2022",
        "end": "06/2026",
        "sort_order": 3,
        "bullets": [
            "Grade: Excellent — GPA 3.79.",
            "Graduation project (Bizify) ranked Top 4 among graduation projects.",
        ],
    },
    {
        "org": "Digital Egypt Pioneers Initiative (DEPI)",
        "role": "Scholarship — .NET Web Development Track",
        "kind": "education",
        "start": "04/2024",
        "end": "12/2024",
        "sort_order": 4,
        "bullets": [
            "Full-stack .NET web development scholarship track.",
            "Built a Library management system (ASP.NET Core 8 MVC, EF Core, SQL Server) — members, "
            "books, checkouts, orders, penalties — later re-architected into the layered Bookish platform.",
        ],
    },
    {
        "org": "ITI",
        "role": "Flutter Cross-Platform Development — Mobile App Track",
        "kind": "education",
        "start": "08/2025",
        "end": "09/2025",
        "sort_order": 5,
        "bullets": ["Intensive Flutter cross-platform mobile development training."],
    },
]

CERTIFICATES = [
    {"title": "NASA Space Apps Challenge", "issuer": "NASA"},
    {"title": "Computer Vision", "issuer": ""},
    {"title": "AI Fundamentals", "issuer": ""},
    {"title": "Machine Learning with Python (V2)", "issuer": "IBM"},
    {"title": "Generative AI and LLMs", "issuer": ""},
    {"title": "MLOps Concepts", "issuer": ""},
    {"title": "AWS AI Practitioner", "issuer": "AWS", "url": None},
]

# The RAG knowledge base: first-person facts the AI persona may answer from.
KNOWLEDGE = [
    (
        "Profile & contact",
        "cv",
        [
            "I'm Afnan Hany Youssef, an AI Developer from Egypt. I build production AI systems: "
            "LLM applications, RAG pipelines, AI orchestrators, MCP-based agent workflows, and "
            "FastAPI backends. You can reach me at afnanhany18@gmail.com or +20 1557929312, and "
            "find me on LinkedIn as Afnan Hany. My languages: Arabic (native) and English (fluent).",
            "My current focus is agentic AI systems — multi-agent orchestration, RAG, and MCP — "
            "combined with solid backend engineering (FastAPI, PostgreSQL, Redis, Docker). "
            "I'm open to AI engineering roles, freelance AI projects, and startup collaborations.",
        ],
    ),
    (
        "Education",
        "cv",
        [
            "I'm studying for a B.A. in Humanities, Commerce & Business Administration with a major "
            "in B.I.D.T at Helwan National University (09/2022 – 06/2026). Grade: Excellent, GPA 3.79. "
            "My graduation project, Bizify, ranked Top 4 among graduation projects.",
            "I completed a scholarship in the .NET Web Development track at the Digital Egypt Pioneers "
            "Initiative (04/2024 – 12/2024), and Flutter cross-platform mobile development training at "
            "ITI (08/2025 – 09/2025).",
        ],
    ),
    (
        "IBM AI Internship",
        "cv",
        [
            "At my IBM AI internship (07/2025 – 09/2025) I developed LLM-powered chatbots and "
            "multimodal AI solutions supporting speech, text, and bilingual OCR in English and Arabic. "
            "I built AI orchestrators and MCP-based pipelines to automate agent workflows, improving "
            "operational efficiency and response accuracy.",
            "Beyond engineering at IBM, I conducted market research and competitor analysis to identify "
            "business opportunities, and designed presentations communicating AI solutions and business "
            "value to stakeholders. I also developed responsive Flutter mobile UI features integrated "
            "with backend APIs.",
        ],
    ),
    (
        "TAQA Arabia internship & DECI teaching",
        "cv",
        [
            "At TAQA Arabia (IT internship, 07/2023 – 09/2023) I automated daily browser tasks with "
            "scripts and streamlined data migration from Excel to SAP, improving accuracy.",
            "As a Software Programming Instructor Assistant at the Digital Egypt Cubs Initiative "
            "(12/2024 – 06/2025) I taught software engineering, algorithms, problem-solving, and soft "
            "skills.",
        ],
    ),
    (
        "Project: Bizify",
        "project",
        [
            "Bizify is my graduation project: an AI-powered startup development platform that helps "
            "entrepreneurs generate, validate, and execute startup ideas through AI-assisted market "
            "research, competitor analysis, supplier discovery, business planning, roadmap tracking, "
            "and real-time business insights. Tech: React.js, FastAPI, PostgreSQL, SQLAlchemy, Redis, "
            "JWT/OAuth, SSE streaming, PayPal API, Paymob, and the OpenAI SDK. It ranked Top 4 among "
            "graduation projects at Helwan National University. Bizify is live at "
            "https://bizify-v2.vercel.app/",
        ],
    ),
    (
        "Project: FenTech",
        "project",
        [
            "FenTech is an intelligent financial management assistant I built during my IBM AI "
            "internship. It helps users track expenses, manage budgets, create savings plans, and get "
            "personalized investment guidance. It uses a multi-agent architecture with AutoGen (AG2) "
            "over Azure OpenAI, MCP for tool access, FastAPI, and real-time WebSockets.",
        ],
    ),
    (
        "Project: Exo Scan AI",
        "project",
        [
            "Exo Scan AI is my NASA Space Apps Challenge 2025 project: a RandomForest-based machine "
            "learning pipeline that classifies exoplanet signals from NASA's Kepler dataset into "
            "confirmed planets, candidates, and false positives, optimized for minority-class recall. "
            "Built with Python, scikit-learn, Pandas, and NumPy.",
        ],
    ),
    (
        "Project: Bookish",
        "project",
        [
            "Bookish is a bilingual (Arabic/English) library management system I built by rewriting a "
            "DEPI library monolith into a clean 4-layer ASP.NET Core 8 solution: a REST API "
            "(YatApp.API), a BLL with domain models and DTOs, a DAL with EF Core plus "
            "Repository/UnitOfWork, and an MVC front-end that consumes the API. I took it from an "
            "abandoned skeleton (only ~2 of 6 features wired, sessions/auth commented out, login "
            "methods throwing NotImplementedException) to a working app: I migrated the database from "
            "SQL Server to PostgreSQL (Npgsql), added 10 API controllers for full parity, hashed "
            "passwords with ASP.NET Identity, containerized the API and UI with Docker, and redesigned "
            "it into an 'Antiquarian' vintage bilingual library with borrow/buy flows, an admin panel, "
            "RTL Arabic support, and EGP pricing. It is deployed on Railway and live at "
            "https://vivacious-trust-production-dfa4.up.railway.app/",
        ],
    ),
    (
        "Project: DEPI Library (original)",
        "project",
        [
            "During my DEPI (Digital Egypt Pioneers Initiative) .NET scholarship in 2024 I built a "
            "Library management system as a single-project ASP.NET Core 8 MVC monolith with EF Core "
            "8 and SQL Server. It covered members and roles, books with authors/categories/series, "
            "checkouts (borrow/return), orders with payments and shipping, and penalties. I later "
            "re-architected that monolith into the layered Bookish platform. The original source is on "
            "GitHub at https://github.com/Afnan-Hany/DEPI-Project.git",
        ],
    ),
    (
        "Skills",
        "cv",
        [
            "AI & ML skills: OpenAI Agents SDK, AutoGen, LangChain, LangGraph, MCP, AI orchestration, "
            "LLM applications, NLP, OCR, Hugging Face, PyTorch, scikit-learn, CNNs, RNNs, GANs, "
            "machine learning, and data pipelines.",
            "Programming languages: Python, C#, C++, Java, JavaScript, Dart, HTML, CSS, and Node.js. "
            "Frameworks and tools: FastAPI, Flask, ASP.NET MVC, Express.js, Spring Boot, Flutter, Figma.",
            "Databases: SQL Server, MySQL, MongoDB with Mongoose. APIs: RESTful design, Postman, "
            "Swagger. Testing: Jest, unit testing, integration testing, TDD. DevOps: Docker, Railway. "
            "Security: JWT, API key authentication, SSL/TLS, CORS. Automation: Power Automate.",
        ],
    ),
    (
        "Certificates & goals",
        "cv",
        [
            "My certificates include: NASA Space Apps Challenge, Computer Vision, AI Fundamentals, "
            "Machine Learning with Python (V2), Generative AI and LLMs, and MLOps Concepts. I'm "
            "preparing for the AWS AI Practitioner certification, expected August 2026.",
            "Services I offer: AI chatbots, LLM applications, automation, FastAPI APIs, machine "
            "learning, computer vision, OCR, AI consulting, and AI MVP development.",
        ],
    ),
]

BLOG_POSTS = [
    {
        "slug": "building-bizify-ai-startup-platform",
        "title": "Building Bizify: what shipping a real AI product taught me",
        "excerpt": (
            "Nine AI-generated plan sections, SSE streaming, two payment providers, and a Top 4 "
            "graduation project rank — the engineering lessons behind Bizify."
        ),
        "reading_minutes": 6,
        "body_mdx": """
Bizify started as a graduation project requirement and became a production-grade AI platform.
Here are the three lessons that changed how I build AI products.

## 1. Streaming is a product feature, not a transport detail

Founders asked Bizify for market analyses that take 30–60 seconds to generate. With a spinner,
that feels broken. With SSE token streaming, the same latency feels alive. We stream every AI
section — market potential, competition, customers, business model, unit economics, go-to-market —
and regeneration became something users *enjoy* watching.

## 2. Structured output needs contracts

Free-form LLM text doesn't survive a UI. Every Bizify section has a strict schema the model must
fill, validated server-side in FastAPI before it ever reaches React. When validation fails, we
regenerate with the error in context. Reliability went from "demo-grade" to "production-grade."

## 3. Payments teach you defensive engineering

Integrating PayPal and Paymob forced idempotent webhook handlers, signature verification, and
reconciliation jobs. AI code can be regenerated; money bugs cannot.

Bizify ranked **Top 4 among graduation projects** at Helwan National University — but the real
outcome is the playbook above, which I now apply to every AI system I build.
""",
    },
]


async def seed(db: Session) -> None:
    # Admin user
    if not db.execute(select(User).limit(1)).scalar_one_or_none():
        db.add(
            User(
                email=settings.admin_email,
                full_name="Afnan Hany Youssef",
                hashed_password=hash_password(settings.admin_password),
                role="admin",
            )
        )
        db.commit()
        logger.info("Seeded admin user %s", settings.admin_email)

    # Structured content
    if not db.execute(select(Project).limit(1)).scalar_one_or_none():
        for p in PROJECTS:
            db.add(Project(**p))
        for e in EXPERIENCE:
            db.add(Experience(**e))
        for c in CERTIFICATES:
            db.add(Certificate(**c))
        for b in BLOG_POSTS:
            db.add(BlogPost(**b, published_at=datetime(2026, 6, 1, tzinfo=timezone.utc)))
        db.commit()
        logger.info("Seeded projects, experience, certificates, blog")

    # Knowledge base — idempotent per document title so entries added later
    # (e.g. new projects) are ingested on the next boot of an existing deployment.
    existing_titles = set(
        db.execute(select(KnowledgeDocument.title)).scalars().all()
    )
    added = 0
    for title, source_type, texts in KNOWLEDGE:
        if title in existing_titles:
            continue
        await rag.ingest_document(db, title=title, source_type=source_type, texts=texts)
        added += 1
    if added:
        logger.info("Seeded knowledge base (%d new documents)", added)

    # Deep Bizify knowledge — gated separately so it can be added to an already
    # seeded database (existing deployment) on the next boot.
    await seed_bizify_knowledge(db)


async def seed_bizify_knowledge(db: Session) -> None:
    """Ingest the README + sequence-diagram knowledge for the Bizify chatbot.

    Idempotent: skips if these documents are already present.
    """
    existing = db.execute(
        select(func.count())
        .select_from(KnowledgeDocument)
        .where(KnowledgeDocument.source_type == BIZIFY_KB_SOURCE_TYPE)
    ).scalar() or 0
    if existing:
        return
    if not BIZIFY_KB_PATH.exists():
        logger.warning("Bizify knowledge asset not found at %s — skipping", BIZIFY_KB_PATH)
        return

    docs = json.loads(BIZIFY_KB_PATH.read_text(encoding="utf-8"))
    for doc in docs:
        texts = [t for t in doc.get("texts", []) if t.strip()]
        if not texts:
            continue
        await rag.ingest_document(
            db,
            title=doc["title"],
            source_type=BIZIFY_KB_SOURCE_TYPE,
            texts=texts,
            source_url=doc.get("source_url"),
        )
    logger.info("Seeded deep Bizify knowledge (%d documents)", len(docs))
