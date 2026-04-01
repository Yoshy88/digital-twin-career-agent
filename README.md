# Digital Twin Career Agent
### Team 1

An AI-powered Digital Twin that represents a professional 24/7. Built with Next.js 16, Vercel AI SDK v6, and Neon Postgres.

---

## Project Overview
This system allows recruiters, hiring managers, and collaborators to interact with an AI agent that represents the owner. Visitors can ask questions, exchange contact information, and book meetings — all without the owner being present.

---

## Repository Structure
```
digital-twin-career-agent/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── chat/
│   │       └── tools/
│   ├── components/
│   │   ├── chat/
│   │   └── ui/
│   └── lib/
│       ├── ai/
│       ├── db/
│       ├── workflows/
│       └── voice/
├── .env.example
├── prd.md
├── agents.md
├── readme.md
└── design.md
```

---

## Documentation
- [Product Requirements Document](./prd.md)
- [Agents & Architecture](./agents.md)
- [Technical Design](./design.md)