import { endConversation, getConversationMessages } from '@/lib/db/queries'

function summarizeConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const userMessages = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content.trim())
    .filter(Boolean)

  if (userMessages.length === 0) {
    return 'No user messages recorded.'
  }

  return userMessages.slice(0, 3).join(' | ')
}

export async function triggerFollowUp(conversationId: string) {
  try {
    const ended = await endConversation(conversationId)
    if (!ended) {
      console.log(`Follow-up skipped for conversation ${conversationId}: already ended or missing`)
      return
    }

    const messages = await getConversationMessages(conversationId)
    const summary = summarizeConversation(messages)

    console.log(`Follow-up workflow triggered for conversation: ${conversationId}`)
    console.log(`Follow-up summary: ${summary}`)
  } catch (error) {
    console.error('Follow-up workflow failed:', error)
  }
}
