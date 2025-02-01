import { useCallback, useMemo, useRef, useState } from 'react'

/**
 *
 * @param {function} query call api
 * @param {function?} handler list update handler
 * @param {function?} onError error callback
 * @returns {{list: any[], next: function, loading: boolean}}
 */
export default function useAnchorAPI<
  Item = unknown,
  Result extends { list: Item[], anchor: string | null } = { list: Item[], anchor: string | null }
>(
  query: (anchor: string | null) => Promise<Result>,
  handler?: (reset: boolean, prev: Item[], result: Result) => Item[],
  onError?: (err: unknown) => void
) {
  const [list, setList] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [anchor, setAnchor] = useState<string | null>(null)

  const hasNext = useRef(true)
  const queryRef = useRef(query)
  const handlerRef = useRef(handler)
  const onErrorRef = useRef(onError)

  queryRef.current = query
  handlerRef.current = handler
  onErrorRef.current = onError

  const next = useCallback(
    async (reset = false) => {
      try {
        if (!reset && !hasNext.current) { return }
        setLoading(true)

        const result = await queryRef.current(reset ? null : anchor)

        if (typeof handlerRef.current === 'function') {
          setList((prev) => handlerRef.current!(reset, prev, result))
        } else {
          // default update list method (handler not set)
          setList((prev) => reset ? result.list : [...prev, ...result.list])
        }

        setAnchor(result.anchor)
        hasNext.current = !!result.anchor

        console.log('list:', list)
      } catch (err) {
        console.warn('api error', err)
        onErrorRef.current && onErrorRef.current(err)

      } finally {
        setLoading(false)
      }
    },
    [anchor]
  )

  return useMemo(
    () => ({ list, next, loading }),
    [next, list, loading]
  )
}
