import { useRouter } from 'next/router'
import WelcomeScreen from '../components/WelcomeScreen'
import { useAppStateContext } from '../hooks/AppStateContext'

export default function Home() {
  const router = useRouter()
  const { homeAddress, completed, handleShowOnboarding } = useAppStateContext()

  return (
    <WelcomeScreen
      homeAddress={homeAddress}
      onShowOnboarding={handleShowOnboarding}
      completedSteps={[...completed]}
      onSelectStep={(id) => id && router.push(`/step/${id}`)}
    />
  )
}
