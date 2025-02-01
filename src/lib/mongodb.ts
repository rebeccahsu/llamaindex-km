import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

const cached = global as any

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null }
}

async function mongoDBConnect() {
  if (cached.mongoose.conn) {
    console.log('Using cached MongoDB connection')
    return cached.mongoose.conn
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false
    }

    console.log('Creating new MongoDB connection...')
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully')
    })

    mongoose.connection.on('error', (err) => {
      console.log('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })

    // clean up on app termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('MongoDB connection closed through app termination')
        process.exit(0)
      } catch (err) {
        console.log('Error closing MongoDB connection:', err)
        process.exit(1)
      }
    })

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise
    console.log(`MongoDB connected to database: ${mongoose.connection.name}`)
  } catch (e) {
    console.log('Error connecting to MongoDB:', e)
    cached.mongoose.promise = null
    throw e
  }

  return cached.mongoose.conn
}

export default mongoDBConnect