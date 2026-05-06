import { createContext, type Dispatch } from 'react'
import type { Action, State } from './types'

export const StoreContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(
  null,
)
