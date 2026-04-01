# Product Requirements Document (PRD)
## Digital Twin Career Agent — Team 1

---

## Product Overview
An AI-powered Digital Twin that represents a professional 24/7. Visitors (recruiters, hiring managers, collaborators) can interact with the agent via web or voice to learn about skills, book meetings, and exchange contact information.

---

## AI Study & Reference URLs
- [Next.js 16 Blog](https://nextjs.org/blog/next-16)
- [Vercel AI SDK v6 Announcement](https://v6.ai-sdk.dev/docs/announcing-ai-sdk-6-beta)
- [Vercel AI SDK — Building Agents](https://v6.ai-sdk.dev/docs/agents/building-agents)
- [Vercel AI SDK — Workflows](https://v6.ai-sdk.dev/docs/agents/workflows)
- [Neon Postgres](https://neon.tech/docs/introduction)
- [Deepgram STT](https://developers.deepgram.com/docs)
- [ElevenLabs TTS](https://elevenlabs.io/docs)
- [Twilio Voice](https://www.twilio.com/docs/voice)
- [Shadcn UI](https://ui.shadcn.com/docs)

---

## Functional Requirements
1. Visitors can open a chat interface and converse with the AI agent in real time
2. The agent maintains conversation history and context across a session
3. The agent can save visitor contact information to the database via tool-calling
4. The agent can fetch the owner's profile data and present it to visitors
5. The agent can trigger a meeting booking workflow
6. All conversations and visitor metadata are stored in Neon Postgres
7. A follow-up email workflow is triggered after a conversation ends
8. (Phase 2) Visitors can interact via phone call using speech-to-text and text-to-speech
9. (Phase 2) Twilio routes incoming calls to the voice-enabled AI agent

---

## Non-Functional Requirements
1. The chat interface must stream responses in real time with no perceptible delay
2. The system must handle multiple simultaneous visitors without degradation
3. All API keys and secrets must be stored in environment variables, never in code
4. The codebase must be TypeScript throughout
5. The application must be fully responsive on mobile and desktop
6. All database queries must be parameterised to prevent SQL injection
7. The system must be deployable to Vercel with zero manual server configuration

---

## Acceptance Criteria
- [ ] A visitor can open the web app and send a message to the AI agent
- [ ] The agent responds with streamed text in real time
- [ ] The agent correctly identifies visitor intent (inquiry, booking, contact exchange)
- [ ] Contact information submitted by a visitor is saved to the database
- [ ] A conversation transcript is stored after each session
- [ ] A follow-up workflow triggers after a session ends
- [ ] The app is deployed and accessible via a public Vercel URL
- [ ] (Phase 2) A visitor can call a phone number and speak to the agent naturally