import { useEffect } from 'react'
import { useRouter } from 'next/router'
import StepPlaceholder from '../../components/StepPlaceholder'
import Step1Pricing from '../../components/steps/Step1Pricing'
import Step2Repairs from '../../components/steps/Step2Repairs'
import Step3Staging from '../../components/steps/Step3Staging'
import Step4Listing from '../../components/steps/Step4Listing'
import Step5Showings from '../../components/steps/Step5Showings'
import Step6Offers from '../../components/steps/Step6Offers'
import Step7Inspection from '../../components/steps/Step7Inspection'
import Step8Title from '../../components/steps/Step8Title'
import Step9Closing from '../../components/steps/Step9Closing'
import { steps } from '../../data/steps'
import { useAppStateContext } from '../../hooks/AppStateContext'

export default function StepPage() {
  const router = useRouter()
  const { id } = router.query

  const {
    homeAddress,
    completed,
    priceEstimate,
    handleComplete,
    handleUndo,
    handlePriceUpdate,
  } = useAppStateContext()

  const stepId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (id === undefined) return
    const num = parseInt(id, 10)
    if (isNaN(num) || num < 1 || num > 9) {
      router.replace('/')
    }
  }, [id, router])

  const handleSelect = (targetId) => {
    if (targetId === null) router.push('/')
    else router.push(`/step/${targetId}`)
  }

  if (!stepId || stepId < 1 || stepId > 9) return null

  const step = steps.find((s) => s.id === stepId)

  if (stepId === 1) return (
    <Step1Pricing
      homeAddress={homeAddress}
      onComplete={(value) => value ? handleComplete(1) : handleUndo(1)}
      isCompleted={completed.has(1)}
      onPriceUpdate={handlePriceUpdate}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 2) return (
    <Step2Repairs
      onComplete={(value) => value ? handleComplete(2) : handleUndo(2)}
      isCompleted={completed.has(2)}
      onSelectStep={handleSelect}
      onPriceUpdate={handlePriceUpdate}
      priceEstimate={priceEstimate}
    />
  )
  if (stepId === 3) return (
    <Step3Staging
      onComplete={(value) => value ? handleComplete(3) : handleUndo(3)}
      isCompleted={completed.has(3)}
      onSelectStep={handleSelect}
      onPriceUpdate={handlePriceUpdate}
      priceEstimate={priceEstimate}
    />
  )
  if (stepId === 4) return (
    <Step4Listing
      onComplete={(value) => value ? handleComplete(4) : handleUndo(4)}
      isCompleted={completed.has(4)}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 5) return (
    <Step5Showings
      onComplete={(value) => value ? handleComplete(5) : handleUndo(5)}
      isCompleted={completed.has(5)}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 6) return (
    <Step6Offers
      onComplete={(value) => value ? handleComplete(6) : handleUndo(6)}
      isCompleted={completed.has(6)}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 7) return (
    <Step7Inspection
      onComplete={(value) => value ? handleComplete(7) : handleUndo(7)}
      isCompleted={completed.has(7)}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 8) return (
    <Step8Title
      onComplete={(value) => value ? handleComplete(8) : handleUndo(8)}
      isCompleted={completed.has(8)}
      onSelectStep={handleSelect}
    />
  )
  if (stepId === 9) return (
    <Step9Closing
      onComplete={(value) => value ? handleComplete(9) : handleUndo(9)}
      isCompleted={completed.has(9)}
      priceEstimate={priceEstimate}
      onSelectStep={handleSelect}
    />
  )

  return (
    <StepPlaceholder
      step={step}
      isComplete={completed.has(stepId)}
      onComplete={() => handleComplete(stepId)}
      onUndo={() => handleUndo(stepId)}
    />
  )
}
