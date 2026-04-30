import { useRouter } from 'next/router'
import WelcomeScreen from '../components/WelcomeScreen'
import { useAppStateContext } from '../hooks/AppStateContext'

export default function Home() {
  const router = useRouter()
  const { homeAddress, priceEstimate, completed, handleShowOnboarding } = useAppStateContext()

  return (
    <WelcomeScreen
      homeAddress={homeAddress}
      onShowOnboarding={handleShowOnboarding}
      priceEstimate={priceEstimate}
      completedSteps={[...completed]}
      onSelectStep={(id) => id && router.push(`/step/${id}`)}
    />
  )
}
