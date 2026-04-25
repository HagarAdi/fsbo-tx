import { useState, useEffect } from 'react'
import PasswordGate from '../components/PasswordGate'
import Sidebar from '../components/Sidebar'
import WelcomeScreen from '../components/WelcomeScreen'
import OnboardingModal from '../components/OnboardingModal'
import StepPlaceholder from '../components/StepPlaceholder'
import Step1Pricing from '../components/steps/Step1Pricing'
import Step2Repairs from '../components/steps/Step2Repairs'
import Step3Staging from '../components/steps/Step3Staging'
import Step4Listing from '../components/steps/Step4Listing'
import Step5Showings from '../components/steps/Step5Showings'
import Step6Offers from '../components/steps/Step6Offers'
import Step7Inspection from '../components/steps/Step7Inspection'
import Step8Title from '../components/steps/Step8Title'
import Step9Closing from '../components/steps/Step9Closing'
import { steps } from '../data/steps'

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleMobileSelect = (id) => {
    handleSelect(id)
    closeMobileMenu()
  }

  const mainContent = selectedStep ? (
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
    ) : selectedStep.id === 6 ? (
      <Step6Offers
        onComplete={(value) => value ? handleComplete(6) : handleUndo(6)}
        isCompleted={completed.has(6)}
        onSelectStep={handleSelect}
      />
    ) : selectedStep.id === 7 ? (
      <Step7Inspection
        onComplete={(value) => value ? handleComplete(7) : handleUndo(7)}
        isCompleted={completed.has(7)}
        onSelectStep={handleSelect}
      />
    ) : selectedStep.id === 8 ? (
      <Step8Title
        onComplete={(value) => value ? handleComplete(8) : handleUndo(8)}
        isCompleted={completed.has(8)}
        onSelectStep={handleSelect}
      />
    ) : selectedStep.id === 9 ? (
      <Step9Closing
        onComplete={(value) => value ? handleComplete(9) : handleUndo(9)}
        isCompleted={completed.has(9)}
        priceEstimate={priceEstimate}
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
      homeAddress={homeAddress}
      onShowOnboarding={handleShowOnboarding}
      priceEstimate={priceEstimate}
      completedSteps={[...completed]}
      onSelectStep={handleSelect}
    />
  )

  return (
    <PasswordGate>
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile top navigation bar — hidden on md+ */}
      <nav className="md:hidden flex items-center justify-between px-4 border-b border-gray-200 bg-white flex-shrink-0 h-14 z-10">
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className="flex items-center justify-center w-11 h-11 text-xl rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Go to home"
        >
          🏠
        </button>
        <span className="font-bold text-gray-900 text-sm">FSBO Texas Guide</span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center justify-center w-11 h-11 text-xl rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open navigation menu"
        >
          ☰
        </button>
      </nav>

      {/* Below-nav row: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop/tablet sidebar — hidden on mobile */}
        <div className="hidden md:flex md:w-[280px] lg:w-1/4 min-w-[220px] h-full overflow-hidden flex-shrink-0">
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            completed={completed}
            priceEstimate={priceEstimate}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 h-full overflow-y-auto bg-white">
          {mainContent}
        </main>
      </div>

      {showOnboarding && (
        <OnboardingModal onAddressSave={handleAddressSave} />
      )}

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          {/* Sidebar panel slides in from left */}
          <div className="absolute left-0 top-0 h-full w-full bg-white overflow-y-auto">
            <Sidebar
              selectedId={selectedId}
              onSelect={handleMobileSelect}
              completed={completed}
              priceEstimate={priceEstimate}
              onClose={closeMobileMenu}
            />
          </div>
        </div>
      )}
    </div>
    </PasswordGate>
  )
}
