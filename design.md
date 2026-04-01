# Technical Design Document
## Digital Twin Career Agent — Team 1
*Generated with AI assistance based on prd.md*

---

## 1. System Overview
The Digital Twin Career Agent is a full-stack AI application. The core loop is: visitor sends a message → the AI agent interprets intent → tool calls execute backend actions → a response streams back to the visitor → data is persisted and workflows trigger.

---

## 2. Frontend Design

### Pages
- `/` — Landing page with embedded chat interface
- `/api/chat` — Streaming POST endpoint (not a page, but part of the app router)

### Chat UI Component Tree
```
<ChatPage>
  <ChatWindow>
    <MessageList />
    <TypingIndicator />
    <MessageInput />
  </ChatWindow>
</ChatPage>
```

### Streaming Strategy
Use Vercel AI SDK's `useChat` hook which handles:
- Sending messages to `/api/chat`
- Receiving and rendering streamed tokens
- Maintaining local message history

---

## 3. AI Agent Design

### Endpoint: `/api/chat`
```typescript
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: SYSTEM_PROMPT,
    messages,
    tools: { saveContact, fetchProfile, triggerBooking }
  })
  return result.toDataStreamResponse()
}
```

### System Prompt Structure
- Who the agent is (name, role, personality)
- What it can help visitors with
- How to handle bookings and contact exchange
- Tone of voice guidelines
- Fallback behaviour for out-of-scope questions

### Tool Definitions
Each tool has a name, description, parameters schema, and an execute function that calls the relevant API route.

---

## 4. Database Design

### Schema

**visitors**
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | Visitor name |
| email | varchar | Visitor email |
| intent | varchar | recruiter / hiring_manager / collaborator |
| created_at | timestamp | Auto |

**conversations**
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| visitor_id | uuid | Foreign key → visitors |
| started_at | timestamp | Auto |
| ended_at | timestamp | Nullable |

**messages**
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| conversation_id | uuid | Foreign key → conversations |
| role | varchar | user / assistant |
| content | text | Message content |
| created_at | timestamp | Auto |

**bookings**
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| visitor_id | uuid | Foreign key → visitors |
| requested_at | timestamp | Auto |
| status | varchar | pending / confirmed / cancelled |

---

## 5. Workflow Design

### Follow-up Email Workflow
Trigger: conversation ends (visitor closes chat or inactivity timeout)
Steps:
1. Fetch conversation transcript from database
2. Generate summary using AI
3. Send summary email to owner
4. Log workflow completion

---

## 6. Voice Design (Phase 2)

### Call Flow
```
Incoming call (Twilio)
  → Twilio webhook → /api/voice/incoming
  → Stream audio to Deepgram (STT)
  → Text → AI Agent (/api/chat)
  → Response text → ElevenLabs (TTS)
  → Audio streamed back to caller
```

---

## 7. Environment Variables

| Variable | Used By |
|---|---|
| ANTHROPIC_API_KEY | AI agent |
| DATABASE_URL | Neon Postgres |
| DEEPGRAM_API_KEY | Phase 2 STT |
| ELEVENLABS_API_KEY | Phase 2 TTS |
| TWILIO_ACCOUNT_SID | Phase 2 telephony |
| TWILIO_AUTH_TOKEN | Phase 2 telephony |

---

## 8. Deployment
- Platform: Vercel
- Every push to `main` triggers a production deploy
- Every pull request gets an isolated preview deployment
- Environment variables stored in Vercel dashboard, never in code