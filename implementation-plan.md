# Implementation Plan
## Digital Twin Career Agent — Team 1

---

## Team Structure

| Role | Responsibilities |
|---|---|
| Team 1 | AI agent layer, system prompt, tool definitions, architecture decisions, PR reviews |
| Team 2 — Frontend | Chat UI, pages, components, Shadcn UI, streaming integration |
| Team 3 — Backend | API routes, database schema, Neon Postgres, Vercel Workflows |

---

## Phase 1 — Foundation (Week 1–2)

### Team 1
- [ ] Set up Vercel AI SDK v6 in the project
- [ ] Create `/api/chat` streaming endpoint
- [ ] Write the system prompt and agent persona
- [ ] Define `saveContact`, `fetchProfile`, `triggerBooking` tools
- [ ] Connect tool definitions to the chat endpoint
- [ ] Test streaming responses end to end

### Team 2 — Frontend
- [ ] Install and configure Shadcn UI
- [ ] Build `<ChatWindow>` component with message list
- [ ] Build `<MessageInput>` component
- [ ] Add typing/streaming indicator
- [ ] Connect chat UI to `/api/chat` using `useChat` hook
- [ ] Make layout fully responsive (mobile + desktop)

### Team 3 — Backend
- [ ] Provision Neon Postgres database
- [ ] Write and run database schema migrations (visitors, conversations, messages, bookings)
- [ ] Build `/api/tools/save-contact` route handler
- [ ] Build `/api/tools/fetch-profile` route handler
- [ ] Build `/api/tools/trigger-booking` route handler
- [ ] Set up Vercel Workflows for follow-up email job

---

## Phase 2 — Integration (Week 3)

### All Teams
- [ ] Connect tool calls end to end (AI agent → API routes → database)
- [ ] Test full conversation flow: visitor sends message → agent responds → data saved
- [ ] Handle errors and edge cases gracefully
- [ ] Write seed data for testing (sample visitor, sample conversation)
- [ ] Deploy to Vercel and verify production environment

### Team 1
- [ ] Review and merge all PRs from Team 2 and Team 3
- [ ] Tune system prompt based on test conversations
- [ ] Add guardrails for out-of-scope questions

### Team 2 — Frontend
- [ ] Polish UI (animations, loading states, error messages)
- [ ] Build analytics/insights view (conversation history)
- [ ] Accessibility review

### Team 3 — Backend
- [ ] Add input validation and rate limiting to all API routes
- [ ] Verify all database queries are parameterised
- [ ] Test Vercel Workflow triggers

---

## Phase 3 — Voice (Week 4+)

- [ ] Integrate Deepgram WebSocket for real-time speech-to-text (Team 2)
- [ ] Integrate ElevenLabs for text-to-speech responses (Team 1)
- [ ] Set up Twilio webhook for incoming phone calls (Team 3)
- [ ] Build `/api/voice/incoming` route handler (Team 3)
- [ ] Test full voice call flow end to end (All)

---

## Branching & Workflow Rules

| Rule | Detail |
|---|---|
| Branch naming | `feature/your-name-feature-name` |
| Commit style | `feat:`, `fix:`, `docs:`, `chore:` |
| Pull requests | Every feature must go through a PR |
| Reviews | Team 1 approves all PRs before merge |
| Secrets | Never committed — use `.env.local` locally, Vercel dashboard in production |

---

## Weekly Milestones

| Week | Goal |
|---|---|
| Week 1 | Repo setup, documentation, project scaffold |
| Week 2 | Technical design, implementation plan, begin Phase 1 build |
| Week 3 | Phase 1 complete, integration in progress |
| Week 4 | Full integration done, deployed to Vercel |
| Week 5+ | Voice interface (Phase 2) |

---

## Definition of Done
A feature is considered done when:
1. Code is written and tested locally
2. A pull request is opened with a clear description
3. Team 1 has reviewed and approved
4. All checks pass
5. Branch is merged into `main`
6. Feature is verified working on the Vercel preview deployment
