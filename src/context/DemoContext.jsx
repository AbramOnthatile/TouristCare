import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { mockApi } from '../services/mockApi.js'

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const snapshot = await mockApi.getSnapshot()
      setData(snapshot)
      setError('')
      return snapshot
    } catch (loadError) {
      setError(loadError.message || 'TouristCare demo data could not be loaded.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'touristcare.demo.data.v1' || event.key === null) refresh()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refresh])

  const run = useCallback(async (operation, ...args) => {
    const action = mockApi[operation]
    if (typeof action !== 'function') throw new Error(`Unknown TouristCare demo operation: ${operation}`)
    setPendingAction(operation)
    setError('')
    try {
      const result = await action(...args)
      const snapshot = await mockApi.getSnapshot()
      setData(snapshot)
      return result
    } catch (actionError) {
      setError(actionError.message || 'The TouristCare demo action could not be completed.')
      throw actionError
    } finally {
      setPendingAction('')
    }
  }, [])

  const clearError = useCallback(() => setError(''), [])
  const value = useMemo(() => ({
    data,
    loading,
    pendingAction,
    error,
    run,
    refresh,
    clearError,
  }), [data, loading, pendingAction, error, run, refresh, clearError])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoData() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemoData must be used inside DemoProvider.')
  return context
}
