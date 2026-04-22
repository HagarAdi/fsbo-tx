import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import WelcomeScreen from '../components/WelcomeScreen'
import StepPlaceholder from '../components/StepPlaceholder'
import { steps } from '../data/steps'

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)

  const [completed, setCompleted] = useState(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem('fsbo_completedSteps')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — 25% */}
      <div className="w-1/4 min-w-[220px] h-full overflow-hidden flex-shrink-0">
        <Sidebar selectedId={selectedId} onSelect={handleSelect} completed={completed} />
      </div>

      {/* Main area — 75% */}
      <main className="flex-1 h-full overflow-y-auto bg-white">
        {selectedStep ? (
          <StepPlaceholder
            step={selectedStep}
            isComplete={completed.has(selectedStep.id)}
            onComplete={() => handleComplete(selectedStep.id)}
            onUndo={() => handleUndo(selectedStep.id)}
          />
        ) : (
          <WelcomeScreen />
        )}
      </main>
    </div>
  )
}
