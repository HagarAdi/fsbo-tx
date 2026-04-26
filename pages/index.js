import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PasswordGate from '../components/PasswordGate'
import Sidebar from '../components/Sidebar'
import WelcomeScreen from '../components/WelcomeScreen'
import OnboardingModal from '../components/OnboardingModal'
import { useAppState } from '../hooks/useAppState'

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    homeAddress,
    showOnboarding,
    completed,
    priceEstimate,
    handleAddressSave,
    handleShowOnboarding,
  } = useAppState()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <PasswordGate>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Mobile top navigation bar — hidden on md+ */}
        <nav className="md:hidden flex items-center justify-between px-4 border-b border-gray-200 bg-white flex-shrink-0 h-14 z-10">
          <Link
            href="/"
            className="flex items-center justify-center w-11 h-11 text-xl rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go to home"
          >
            🏠
          </Link>
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
              completed={completed}
              priceEstimate={priceEstimate}
            />
          </div>

          {/* Main content area */}
          <main className="flex-1 h-full overflow-y-auto bg-white">
            <WelcomeScreen
              homeAddress={homeAddress}
              onShowOnboarding={handleShowOnboarding}
              priceEstimate={priceEstimate}
              completedSteps={[...completed]}
              onSelectStep={(id) => id && router.push(`/step/${id}`)}
            />
          </main>
        </div>

        {showOnboarding && (
          <OnboardingModal onAddressSave={handleAddressSave} />
        )}

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-full bg-white overflow-y-auto">
              <Sidebar
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
