import mongoose, { Model, Document, Schema, Types } from 'mongoose'

const MODEL_NAME = 'users'

export interface UserData {
  name?: string
  email: string
  salt: string
  password: string
  department?: string
}

export interface UserDocument extends UserData, Document {
  createdAt: number
  updatedAt: number
  version: number
}

const schema = new Schema<UserDocument, Model<UserDocument>>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: String, default: 'hr' },

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

schema.index({ email: 1, _id: 1 }, { background: true })

const model = mongoose.models[MODEL_NAME] || mongoose.model<UserDocument, Model<UserDocument>>(MODEL_NAME, schema)

model.on('index', (err: Error) => {
  if (err) {
    console.warn(`${model.name} index`, err)
  }
})

export default model
