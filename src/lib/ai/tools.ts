import { z } from 'zod'
import {
  createBooking,
  fetchOwnerProfile,
  saveVisitorContact,
  type VisitorIntent
} from '@/lib/db/queries'

export const tools = {
  saveContact: {
    description: 'Save a visitor contact when they share their name and email',
    inputSchema: z.object({
      name: z.string().describe('The visitor full name'),
      email: z.string().email().describe('The visitor email address'),
      intent: z.enum(['recruiter', 'hiring_manager', 'collaborator', 'other'])
        .describe('The visitor reason for reaching out')
    }),
    execute: async ({ name, email, intent }: { name: string; email: string; intent: string }) => {
      try {
        const visitor = await saveVisitorContact({
          name,
          email,
          intent: intent as VisitorIntent
        })

        return {
          success: true,
          visitorId: visitor.id,
          message: `Thanks, ${name}. Dwight has your details and will follow up soon.`
        }
      } catch (error) {
        console.error('saveContact tool error:', error)
        return { success: false, message: 'I could not save your contact right now.' }
      }
    }
  },

  fetchProfile: {
    description: "Fetch Dwight's full profile when a visitor asks about his background or skills",
    inputSchema: z.object({
      placeholder: z.string().optional()
    }),
    execute: async () => {
      return await fetchOwnerProfile()
    }
  },

  triggerBooking: {
    description: 'Trigger a meeting booking when a visitor wants to schedule time with Dwight',
    inputSchema: z.object({
      visitorName: z.string().describe('The name of the visitor requesting a booking'),
      visitorEmail: z.string().email().optional().describe('Optional visitor email')
    }),
    execute: async ({ visitorName, visitorEmail }: { visitorName: string; visitorEmail?: string }) => {
      try {
        const booking = await createBooking({ visitorName, visitorEmail })

        return {
          success: true,
          bookingId: booking.id,
          status: booking.status,
          message: `Booking requested for ${visitorName}. Dwight will be in touch shortly.`
        }
      } catch (error) {
        console.error('triggerBooking tool error:', error)
        return { success: false, message: 'I could not create a booking request right now.' }
      }
    }
  }
}