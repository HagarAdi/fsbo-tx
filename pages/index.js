import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import WelcomeScreen from '../components/WelcomeScreen'
import StepPlaceholder from '../components/StepPlaceholder'
import { steps } from '../data/steps'

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)
  const [completed, setCompleted] = useState(new Set())

  const selectedStep = steps.find((s) => s.id === selectedId) ?? null

  const handleComplete = (id, value) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      value ? next.add(id) : next.delete(id)
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — 25% */}
      <div className="w-1/4 min-w-[220px] h-full overflow-hidden flex-shrink-0">
        <Sidebar selectedId={selectedId} onSelect={setSelectedId} completed={completed} />
      </div>

      {/* Main area — 75% */}
      <main className="flex-1 h-full overflow-y-auto bg-white">
        {selectedStep ? (
          <StepPlaceholder
            step={selectedStep}
            isComplete={completed.has(selectedStep.id)}
            onComplete={(value) => handleComplete(selectedStep.id, value)}
          />
        ) : (
          <WelcomeScreen />
        )}
      </main>
    </div>
  )
}
