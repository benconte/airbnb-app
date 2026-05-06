import { useReducer, type PropsWithChildren } from 'react'
import { StoreContext } from './context'
import { reducer } from './reducer'
import type { State } from './types'

const initialState: State = {
  listings: [],
  loading: true,
  filter: '',
  saved: [],
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}
