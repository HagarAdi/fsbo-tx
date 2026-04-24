import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import WelcomeScreen from '../components/WelcomeScreen'
import StepPlaceholder from '../components/StepPlaceholder'
import Step1Pricing from '../components/steps/Step1Pricing'
import Step2Repairs from '../components/steps/Step2Repairs'
import Step3Staging from '../components/steps/Step3Staging'
import Step4Listing from '../components/steps/Step4Listing'
import Step5Showings from '../components/steps/Step5Showings'
import { steps } from '../data/steps'

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)

  const [homeAddress] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('fsbo_homeAddress') || ''
  })

  const [completed, setCompleted] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('fsbo_completedSteps')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [priceEstimate, setPriceEstimate] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('fsbo_priceEstimate')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const selectedStep = steps.find((s) => s.id === selectedId) ?? null

  const handleSelect = (id) => {
    setSelectedId(id)
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — 25% */}
      <div className="w-1/4 min-w-[220px] h-full overflow-hidden flex-shrink-0">
        <Sidebar selectedId={selectedId} onSelect={handleSelect} completed={completed} priceEstimate={priceEstimate} />
      </div>

      {/* Main area — 75% */}
      <main className="flex-1 h-full overflow-y-auto bg-white">
        {selectedStep ? (
          selectedStep.id === 1 ? (
            <Step1Pricing
              homeAddress={homeAddress}
              onComplete={(value) => value ? handleComplete(1) : handleUndo(1)}
              isCompleted={completed.has(1)}
              onPriceUpdate={handlePriceUpdate}
              onSelectStep={handleSelect}
            />
          ) : selectedStep.id === 2 ? (
            <Step2Repairs
              onComplete={(value) => value ? handleComplete(2) : handleUndo(2)}
              isCompleted={completed.has(2)}
              onSelectStep={handleSelect}
              onPriceUpdate={handlePriceUpdate}
              priceEstimate={priceEstimate}
            />
          ) : selectedStep.id === 3 ? (
            <Step3Staging
              onComplete={(value) => value ? handleComplete(3) : handleUndo(3)}
              isCompleted={completed.has(3)}
              onSelectStep={handleSelect}
              onPriceUpdate={handlePriceUpdate}
              priceEstimate={priceEstimate}
            />
          ) : selectedStep.id === 4 ? (
            <Step4Listing
              onComplete={(value) => value ? handleComplete(4) : handleUndo(4)}
              isCompleted={completed.has(4)}
              onSelectStep={handleSelect}
            />
          ) : selectedStep.id === 5 ? (
            <Step5Showings
              onComplete={(value) => value ? handleComplete(5) : handleUndo(5)}
              isCompleted={completed.has(5)}
              onSelectStep={handleSelect}
            />
          ) : (
            <StepPlaceholder
              step={selectedStep}
              isComplete={completed.has(selectedStep.id)}
              onComplete={() => handleComplete(selectedStep.id)}
              onUndo={() => handleUndo(selectedStep.id)}
            />
          )
        ) : (
          <WelcomeScreen
            priceEstimate={priceEstimate}
            completedSteps={[...completed]}
            onSelectStep={handleSelect}
          />
        )}
      </main>
    </div>
  )
}
