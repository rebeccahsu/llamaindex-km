import mongoose, { Model, Document, Schema, Types } from 'mongoose'
import { EDocFileStatus } from './constants'

const MODEL_NAME = 'document_files'

export interface DocumentFileData {
  name: string
  path: string
  docIds: string[]
  status: EDocFileStatus
  collectionName?: string
  permission?: string
}

export interface DocumentFileDocument extends DocumentFileData, Document {
  createdAt: number
  updatedAt: number
  version: number
}

const schema = new Schema<DocumentFileDocument, Model<DocumentFileDocument>>({
  name: { type: String, required: true },
  path: { type: String, required: true },
  docIds: { type: [String], default: [] },
  status: { type: String, default: EDocFileStatus.Pending },
  collectionName: { type: String },
  permission: { type: String },

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

// schema.index({ _id: 1 }, { background: true })

const model = mongoose.models[MODEL_NAME] || mongoose.model<DocumentFileDocument, Model<DocumentFileDocument>>(MODEL_NAME, schema)

model.on('index', (err: Error) => {
  if (err) {
    console.warn(`${model.name} index`, err)
  }
})

export default model
