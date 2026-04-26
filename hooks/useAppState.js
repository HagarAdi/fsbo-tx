import { useState, useEffect } from 'react'

export function useAppState() {
  const [homeAddress, setHomeAddress] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [completed, setCompleted] = useState(new Set())
  const [priceEstimate, setPriceEstimate] = useState(null)

  useEffect(() => {
    const address = localStorage.getItem('fsbo_homeAddress') || ''
    setHomeAddress(address)
    setShowOnboarding(!address)

    try {
      const saved = localStorage.getItem('fsbo_completedSteps')
      if (saved) setCompleted(new Set(JSON.parse(saved)))
    } catch {}

    try {
      const saved = localStorage.getItem('fsbo_priceEstimate')
      if (saved) setPriceEstimate(JSON.parse(saved))
    } catch {}
  }, [])

  const handleAddressSave = (address) => {
    localStorage.setItem('fsbo_homeAddress', address)
    setHomeAddress(address)
    setShowOnboarding(false)
  }

  const handleShowOnboarding = () => {
    localStorage.removeItem('fsbo_homeAddress')
    setHomeAddress('')
    setShowOnboarding(true)
  }

  const handleComplete = (id) => {
    setCompleted((prev) => {
      const next = new Set([...prev, id])
      localStorage.setItem('fsbo_completedSteps', JSON.stringify([...next]))
      return next
    })
  }

  const handleUndo = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.delete(id)
      localStorage.setItem('fsbo_completedSteps', JSON.stringify([...next]))
      return next
    })
  }

  const handlePriceUpdate = (estimate) => {
    setPriceEstimate(estimate)
    try {
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(estimate))
    } catch {}
  }

  return {
    homeAddress,
    showOnboarding,
    completed,
    priceEstimate,
    handleAddressSave,
    handleShowOnboarding,
    handleComplete,
    handleUndo,
    handlePriceUpdate,
  }
}
