import { IChatMessageData } from "db/models/ChatHistory"

interface ChatHistory {
  id: string
  name: string
  messages?: IChatMessageData[]
}

export default ChatHistory
