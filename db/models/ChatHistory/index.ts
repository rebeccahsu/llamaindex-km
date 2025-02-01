import mongoose, { Model, Document, Schema, Types, ObjectId } from 'mongoose'
import { ERole } from './constants'
import { Message } from 'ai'

const MODEL_NAME = 'chat_history'

export interface IChatMessageData extends Message {
  messageId: string // from ai, to identify the message as updating content before saving to db
  _id: ObjectId
  annotationsJson?: string
}

export interface ChatHistoryData {
  name: string
  messages?: IChatMessageData[]
}

export interface ChatHistoryDocument extends ChatHistoryData, Document {
  createdAt: number
  updatedAt: number
  version: number
}

const schema = new Schema<ChatHistoryDocument, Model<ChatHistoryDocument>>({
  name: { type: String, required: true },
  messages: [{
    messageId: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(ERole) },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true },
    annotationsJson: { type: String, default: null },
  }],
  
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: Date.now }
}, {
  versionKey: 'version',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    currentTime: Date.now
  }
})

schema.index({ _id: 1 }, { background: true })

const model = mongoose.models[MODEL_NAME] || mongoose.model<ChatHistoryDocument, Model<ChatHistoryDocument>>(MODEL_NAME, schema)

model.on('index', (err: Error) => {
  if (err) {
    console.warn(`${model.name} index`, err)
  }
})

export default model
