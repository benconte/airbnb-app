import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '../../../store/useStore'

export function SearchBar() {
  const {
    state: { filter },
    dispatch,
  } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const debouncedDispatch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch({ type: 'SET_FILTER', payload: value })
      }, 300),
    [dispatch],
  )

  useEffect(() => {
    return () => {
      debouncedDispatch.cancel()
    }
  }, [debouncedDispatch])

  return (
    <label className="search-bar">
      <span className="search-bar__label">Find stays</span>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        placeholder="Search listings..."
        defaultValue={filter}
        onChange={(event) => debouncedDispatch(event.target.value)}
      />
    </label>
  )
}
