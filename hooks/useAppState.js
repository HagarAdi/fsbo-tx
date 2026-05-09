import { useState, useEffect } from 'react'
import { getStepStatuses } from '../utils/getStepStatuses'

export function useAppState() {
  const [homeAddress, setHomeAddress] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stepData, setStepData] = useState({})
  const [priceEstimate, setPriceEstimate] = useState(null)

  useEffect(() => {
    const address = localStorage.getItem('fsbo_homeAddress') || ''
    setHomeAddress(address)
    setShowOnboarding(!address)

    try {
      const saved = localStorage.getItem('fsbo_stepData')
      if (saved) setStepData(JSON.parse(saved))
    } catch {}

    try {
      const saved = localStorage.getItem('fsbo_priceEstimate')
      if (saved) setPriceEstimate(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    const onUpdate = () => {
      try {
        const saved = localStorage.getItem('fsbo_stepData')
        setStepData(saved ? JSON.parse(saved) : {})
      } catch {}
    }
    window.addEventListener('fsbo_stepdata_changed', onUpdate)
    return () => window.removeEventListener('fsbo_stepdata_changed', onUpdate)
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

  const handlePriceUpdate = (estimate) => {
    setPriceEstimate(estimate)
    try {
      localStorage.setItem('fsbo_priceEstimate', JSON.stringify(estimate))
    } catch {}
  }

  const stepStatuses = getStepStatuses(stepData)
  const completed = Object.entries(stepStatuses)
    .filter(([, status]) => status === 'complete')
    .map(([id]) => Number(id))

  return {
    homeAddress,
    showOnboarding,
    stepStatuses,
    completed,
    priceEstimate,
    handleAddressSave,
    handleShowOnboarding,
    handlePriceUpdate,
  }
}
