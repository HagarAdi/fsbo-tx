import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimatePresence, motion } from 'framer-motion'
import PasswordGate from './PasswordGate'
import Sidebar from './Sidebar'
import OnboardingModal from './OnboardingModal'
import { useAppStateContext } from '../hooks/AppStateContext'

const ACCENT = '#16a34a'

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15, ease: 'easeIn' } },
}

export default function Layout({ children }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { homeAddress, showOnboarding, completed, priceEstimate, handleAddressSave } =
    useAppStateContext()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const totalSavings =
    (priceEstimate?.protectedValue || 0) + (priceEstimate?.stagingValue || 0)
  const displaySavings = totalSavings > 0
    ? totalSavings
    : priceEstimate?.currentEstimate
    ? Math.round(priceEstimate.currentEstimate * 0.03)
    : null

  return (
    <PasswordGate>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Mobile top nav */}
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

        {/* Below-nav: sidebar + main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden md:flex md:w-[280px] lg:w-1/4 min-w-[220px] h-full overflow-hidden flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main column */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Sticky cockpit header */}
            {(homeAddress || displaySavings) && (
              <div
                className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-100 z-10"
                style={{ backgroundColor: '#f0fdf4' }}
              >
                <span className="text-xs text-gray-500 truncate max-w-[55%]">
                  📍 {homeAddress || 'No address set'}
                </span>
                {displaySavings && (
                  <span className="text-xs font-semibold" style={{ color: ACCENT }}>
                    💰 ${displaySavings.toLocaleString()} potential savings
                  </span>
                )}
              </div>
            )}

            {/* Animated page content */}
            <main className="flex-1 overflow-y-auto bg-white">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={router.asPath}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {showOnboarding && <OnboardingModal onAddressSave={handleAddressSave} />}

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-full bg-white overflow-y-auto">
              <Sidebar onClose={closeMobileMenu} />
            </div>
          </div>
        )}
      </div>
    </PasswordGate>
  )
}
