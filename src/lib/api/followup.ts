import { triggerFollowUp } from '@/lib/workflows/followup'

const pendingConversations = new Set<string>()

export async function triggerFollowUpOnce(conversationId: string) {
  if (pendingConversations.has(conversationId)) {
    return false
  }

  pendingConversations.add(conversationId)
  try {
    await triggerFollowUp(conversationId)
    return true
  } finally {
    pendingConversations.delete(conversationId)
  }
}
