import Header from '@/components/Header'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-200">
      <Header />

      <main className="flex-1 flex items-center justify-center px-0 sm:px-4 py-4 sm:py-8 overflow-hidden sm:overflow-visible">
        <ChatWindow />
      </main>
    </div>
  )
}
