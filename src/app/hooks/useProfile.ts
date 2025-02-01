import { useEffect, useRef } from 'react'

import Profile from 'src/models/Profile'
import { useUserStore } from 'src/stores'

export default function useProfile(callback: (profile: Profile | null) => void) {
  const loaded = useUserStore((state) => state.loaded)

  const mountRef = useRef(false)
  const callbackRef = useRef(callback)

  callbackRef.current = callback // keep latest

  useEffect(
    () => {
      if (!mountRef.current && loaded) {
        const { profile } = useUserStore.getState()

        callbackRef.current(profile)
        mountRef.current = true
      }
    },
    [loaded]
  )
}
