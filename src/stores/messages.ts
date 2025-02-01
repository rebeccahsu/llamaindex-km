import { Message } from 'ai'
import { create } from 'zustand'
import log from './middlewares/log'

interface MessagesStore {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  setMessageById: (id: string, message: Message) => void

  messagesMap: Record<string, Message[]>
  setMessagesMap: (messagesMap: Record<string, Message[]>) => void
  setMessageInMap: (chatHistoryId: string, message: Message) => void
}

const store = create<MessagesStore>()(
  log(
    (set, get) => ({
      messages: [],
      setMessages: (messages) => set({ messages }),
      setMessageById: (id, message) => {
        const messages = get().messages
        const index = messages.findIndex((m) => m.id === id)
        if (index === -1) return
        const newMessages = [...messages]
        newMessages[index] = message
        set({ messages: newMessages })
      },

      messagesMap: {},
      setMessagesMap: (messagesMap) => set({ messagesMap }),
      setMessageInMap: (chatHistoryId, message) => {
        const messagesMap = get().messagesMap
        const messages = messagesMap[chatHistoryId] || []
        const index = messages.findIndex((m) => m.id === message.id)
        if (index === -1) return
        const newMessages = [...messages]
        newMessages[index] = message
        set({ messagesMap: { ...messagesMap, [chatHistoryId]: newMessages } })
      }

    }),
    'MessagesStore'
  )
)

export default store
