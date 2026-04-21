import { z } from 'zod'

export const saveContactBodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  intent: z.enum(['recruiter', 'hiring_manager', 'collaborator', 'other']).default('other')
})

export const triggerBookingBodySchema = z.object({
  visitorId: z.string().uuid().optional(),
  visitorName: z.string().trim().min(1).optional(),
  visitorEmail: z.string().trim().email().optional()
}).refine((value) => Boolean(value.visitorId || value.visitorName || value.visitorEmail), {
  message: 'Provide visitorId, visitorName, or visitorEmail'
})

export const chatBodySchema = z.object({
  conversationId: z.string().uuid().nullable().optional().transform((value) => value ?? undefined),
  messages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1)
  })).default([])
})

export const endConversationBodySchema = z.object({
  action: z.literal('end')
})
