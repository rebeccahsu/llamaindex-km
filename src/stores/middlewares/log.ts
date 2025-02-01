import { StateCreator } from 'zustand'

// for debug
const log = <T>(config: StateCreator<T, [], []>, prefix = 'Log'): StateCreator<T, [], []> => (set, get, api) =>
  config(
    (...args) => {
      // console.log(' applying', args)
      set(args[0] as T | Partial<T> | ((state: T) => T | Partial<T>), args[1] as false | undefined)
      console.log(`[${prefix}] new state`, get())
    },
    get,
    api
  )

export default log
