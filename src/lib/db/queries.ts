import { getSql } from '@/lib/db/client'

export type VisitorIntent = 'recruiter' | 'hiring_manager' | 'collaborator' | 'other'

export interface Visitor {
  id: string
  name: string
  email: string | null
  intent: VisitorIntent
  created_at: string
}

export interface Booking {
  id: string
  visitor_id: string | null
  requested_at: string
  status: string
}

export interface Conversation {
  id: string
  visitor_id: string | null
  started_at: string
  ended_at: string | null
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface OwnerProfile {
  name: string
  role: string
  skills: string[]
  experience: string
  available_for: string[]
  summary: string
  available: boolean
  contact: string
}

export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  name: 'Dwight Richard Mongaya',
  role: 'Full Stack Developer',
  skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AI/ML', 'Vercel'],
  experience: 'Building modern full-stack and AI-powered applications',
  available_for: ['Full-time roles', 'freelance projects', 'collaborations'],
  summary:
    'Dwight is a Full Stack Developer who builds modern AI-powered web applications with strong product-focused execution across frontend and backend.',
  available: true,
  contact: 'via this chat'
}

export async function fetchOwnerProfile(): Promise<OwnerProfile> {
  const sql = getSql()

  try {
    const rows = await sql`
      SELECT name, role, skills, experience, available_for, summary
      FROM owner_profile
      WHERE id = 1
      LIMIT 1
    ` as Array<{
      name: string
      role: string
      skills: string[]
      experience: string
      available_for: string[]
      summary: string
    }>

    const row = rows[0]
    if (!row) {
      return DEFAULT_OWNER_PROFILE
    }

    return {
      name: row.name,
      role: row.role,
      skills: row.skills,
      experience: row.experience,
      available_for: row.available_for,
      summary: row.summary,
      available: true,
      contact: 'via this chat'
    }
  } catch {
    return DEFAULT_OWNER_PROFILE
  }
}

export async function saveVisitorContact(input: {
  name: string
  email: string
  intent: VisitorIntent
}): Promise<Visitor> {
  const sql = getSql()
  const normalizedEmail = input.email.trim().toLowerCase()

  const rows = await sql`
    INSERT INTO visitors (name, email, intent)
    VALUES (${input.name}, ${normalizedEmail}, ${input.intent})
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      intent = EXCLUDED.intent
    RETURNING id, name, email, intent, created_at
  ` as Visitor[]

  return rows[0]
}

async function resolveVisitorId(input: {
  visitorId?: string
  visitorName?: string
  visitorEmail?: string
}): Promise<string | null> {
  const sql = getSql()

  if (input.visitorId) {
    return input.visitorId
  }

  if (input.visitorEmail) {
    const existingByEmail = await sql`
      SELECT id
      FROM visitors
      WHERE email = ${input.visitorEmail}
      ORDER BY created_at DESC
      LIMIT 1
    ` as { id: string }[]

    if (existingByEmail[0]?.id) {
      return existingByEmail[0].id
    }
  }

  if (input.visitorName) {
    const existingByName = await sql`
      SELECT id
      FROM visitors
      WHERE name = ${input.visitorName}
      ORDER BY created_at DESC
      LIMIT 1
    ` as { id: string }[]

    if (existingByName[0]?.id) {
      return existingByName[0].id
    }
  }

  if (!input.visitorName && !input.visitorEmail) {
    return null
  }

  const created = await sql`
    INSERT INTO visitors (name, email, intent)
    VALUES (
      ${input.visitorName ?? 'Unknown Visitor'},
      ${input.visitorEmail ?? null},
      'other'
    )
    RETURNING id
  ` as { id: string }[]

  return created[0]?.id ?? null
}

export async function createBooking(input: {
  visitorId?: string
  visitorName?: string
  visitorEmail?: string
}): Promise<Booking> {
  const sql = getSql()
  const visitorId = await resolveVisitorId(input)

  const rows = await sql`
    INSERT INTO bookings (visitor_id)
    VALUES (${visitorId})
    RETURNING id, visitor_id, requested_at, status
  ` as Booking[]

  return rows[0]
}

export async function startConversation(visitorId?: string) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO conversations (visitor_id)
    VALUES (${visitorId ?? null})
    RETURNING id
  ` as { id: string }[]

  return rows[0]?.id
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, visitor_id, started_at, ended_at
    FROM conversations
    WHERE id = ${conversationId}
    LIMIT 1
  ` as Conversation[]

  return rows[0] ?? null
}

export async function getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, role, content, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  ` as ConversationMessage[]

  return rows
}

export async function listRecentConversations(limit = 20): Promise<Conversation[]> {
  const sql = getSql()
  const safeLimit = Math.max(1, Math.min(limit, 100))

  const rows = await sql`
    SELECT id, visitor_id, started_at, ended_at
    FROM conversations
    ORDER BY started_at DESC
    LIMIT ${safeLimit}
  ` as Conversation[]

  return rows
}

export async function saveMessage(input: {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
}) {
  const sql = getSql()
  await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${input.conversationId}, ${input.role}, ${input.content})
  `
}

export async function endConversation(conversationId: string) {
  const sql = getSql()
  const rows = await sql`
    UPDATE conversations
    SET ended_at = NOW()
    WHERE id = ${conversationId}
      AND ended_at IS NULL
    RETURNING id
  ` as Array<{ id: string }>

  return Boolean(rows[0]?.id)
}
