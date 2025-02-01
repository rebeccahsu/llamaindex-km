import { create } from 'zustand'

import Profile from '../models/Profile'

import log from './middlewares/log'

interface UserStore {
  profile: Profile | null
  setProfile: (profile: Profile | null) => void

  loaded: boolean
  setLoaded: (loaded: boolean) => void
}

const store = create<UserStore>()(
  log(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),

      loaded: false,
      setLoaded: (loaded) => set({ loaded })
    }),
    'UserStore'
  )
)

export default store
