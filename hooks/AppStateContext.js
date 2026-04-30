import { createContext, useContext } from 'react'
import { useAppState } from './useAppState'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const state = useAppState()
  return <AppStateContext.Provider value={state}>{children}</AppStateContext.Provider>
}

export function useAppStateContext() {
  return useContext(AppStateContext)
}
