import { tool } from 'ai'
import { z } from 'zod'

export const tools = {
  saveContact: tool({
    description: 'Save a visitor contact when they share their name and email',
    parameters: z.object({
      name: z.string().describe('The visitor full name'),
      email: z.string().email().describe('The visitor email address'),
      intent: z.enum(['recruiter', 'hiring_manager', 'collaborator', 'other'])
        .describe('The visitor reason for reaching out')
    }),
    execute: async ({ name, email, intent }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tools/save-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent })
      })
      const data = await res.json()
      return data.success
        ? `Contact saved successfully. I'll make sure John follows up with ${name}.`
        : 'There was an issue saving your contact. Please try again.'
    }
  }),

  fetchProfile: tool({
    description: "Fetch John's full profile when a visitor asks about his background or skills",
    parameters: z.object({
      placeholder: z.string().optional()
    }),
    execute: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tools/fetch-profile`)
      return await res.json()
    }
  }),

  triggerBooking: tool({
    description: 'Trigger a meeting booking when a visitor wants to schedule time with John',
    parameters: z.object({
      visitorName: z.string().describe('The name of the visitor requesting a booking')
    }),
    execute: async ({ visitorName }) => {
      return `Great! I've noted your request, ${visitorName}. John will reach out shortly to confirm a time. Can I also grab your email so he can send a calendar invite?`
    }
  })
}