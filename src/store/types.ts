import type { Listing } from '../features/listings'

export type State = {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: number[]
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: Listing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: number }
  | { type: 'RESET' }
