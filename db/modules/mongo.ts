import mongoose from 'mongoose'

import { delay } from 'src/utils'

class Mongo {
  private uri?: string
  private options?: mongoose.ConnectOptions

  constructor() {
    mongoose.connection.on('connected', this.onConnected)
    mongoose.connection.on('reconnected', this.onReconnected)
    mongoose.connection.on('disconnected', this.onDisconnected)
    mongoose.connection.on('error', this.onError)
  }

  connect = async (uri: string, options?: mongoose.ConnectOptions): Promise<typeof mongoose> => {
    try {
      this.uri = uri
      this.options = options

      return await mongoose.connect(uri, options)
    } catch (err) {
      console.warn(`connect mongo failed, retry after 5 sec`, err)
      await delay(5000)

      return this.connect(uri, options)
    }
  }

  onConnected = () => {
    console.log('Mongo.onConnected')
  }

  onDisconnected = async () => {
    if (!this.uri) {
      console.warn('Mongo.onDisconnected')
      return
    }

    console.warn('Mongo.onDisconnected, retry after 5 sec')

    await delay(5000)
    await this.connect(this.uri, this.options)
  }

  onReconnected = () => {
    console.log('Mongo.onReconnected')
  }

  onError = (err: unknown) => {
    console.warn('Mongo.onError', err)
  }

  close = async () => {
    try {
      delete this.uri
      delete this.options

      return await mongoose.connection.close(true)
    } catch (err) {
      console.warn('close mongodb error,', err)
    }
  }
}

const mongo = new Mongo()
export default mongo
