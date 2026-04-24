import { useState, useEffect, useRef } from 'react'

const ACCENT = '#16a34a'

const PHOTO_TIPS = [
  { emoji: '🌤', text: 'Shoot between 10am–2pm for the best natural light' },
  { emoji: '💡', text: 'Turn on every single light in the house' },
  { emoji: '🪟', text: 'Open all blinds and curtains fully' },
  { emoji: '🧹', text: 'Declutter each room — remove personal items, laundry, dishes' },
  { emoji: '📐', text: 'Shoot from corners with your back against the wall' },
  { emoji: '📱', text: 'Hold phone at chest height, not eye level' },
  { emoji: '🔄', text: 'Get 3–5 shots per room, then pick the best one' },
  { emoji: '☀️', text: 'Exterior shots on sunny days only — never shoot outside on cloudy days' },
]

const WIZARD_STAGES = [
  { id: 'living',    label: 'Living room & common areas 🛋', tip: 'The living room is usually the hero shot — make it count.',                                        maxPhotos: 5, nextLabel: 'Next →' },
  { id: 'kitchen',   label: 'Kitchen 🍳',                    tip: 'Clear the counters completely. Buyers want to see the space, not your stuff.',                      maxPhotos: 3, nextLabel: 'Next →' },
  { id: 'bathrooms', label: 'Bathrooms 🚿',                  tip: 'Close the toilet lid. Remove personal items. Make it look like a hotel.',                           maxPhotos: 5, nextLabel: 'Next →' },
  { id: 'exterior',  label: 'Outside your home 🏡',          tip: 'Front of house, backyard, and any special features like a pool or patio.',                          maxPhotos: 5, nextLabel: 'Done →' },
]

function UploadZone({ photos, onAdd, maxPhotos }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
    const remaining = maxPhotos - photos.length
    const toAdd = valid.slice(0, remaining).map(f => ({ name: f.name, url: URL.createObjectURL(f) }))
    if (toAdd.length > 0) onAdd(toAdd)
  }

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }
  const isFull = photos.length >= maxPhotos

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isFull && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!isFull) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors"
        style={{
          borderColor: dragging ? ACCENT : '#d1d5db',
          backgroundColor: dragging ? '#f0fdf4' : '#fafafa',
          cursor: isFull ? 'default' : 'pointer',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">📷</div>
        {isFull ? (
          <p className="text-sm text-gray-500">Max {maxPhotos} photos uploaded</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Drag photos here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — up to {maxPhotos} photos</p>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative group">
              <img src={p.url} alt={p.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                <span className="text-white text-xs font-medium">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Step4Listing({ onComplete, isCompleted, onSelectStep }) {
  const [wizardStage, setWizardStage] = useState(0)
  const [wizardDone, setWizardDone] = useState(false)
  const [photos, setPhotos] = useState({ living: [], kitchen: [], bathrooms: [], exterior: [] })
  const [showAiTooltip, setShowAiTooltip] = useState(false)
  const completeRef = useRef(null)

  const currentStage = WIZARD_STAGES[wizardStage]
  const totalPhotos = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0)
  const uploadedRooms = WIZARD_STAGES.filter(s => photos[s.id].length > 0).map(s => s.id)

  const addPhotos = (stageId, newPhotos) =>
    setPhotos(prev => ({ ...prev, [stageId]: [...prev[stageId], ...newPhotos] }))

  const advanceWizard = () => {
    if (wizardStage < WIZARD_STAGES.length - 1) {
      setWizardStage(s => s + 1)
    } else {
      setWizardDone(true)
    }
  }

  useEffect(() => {
    if (!wizardDone) return
    try {
      const saved = localStorage.getItem('fsbo_stepData')
      const existing = saved ? JSON.parse(saved) : {}
      localStorage.setItem('fsbo_stepData', JSON.stringify({
        ...existing,
        step4: { ...existing.step4, uploadedRooms },
      }))
    } catch {}
  }, [wizardDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToComplete = () => {
    completeRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="px-10 py-12 max-w-3xl">

      {/* Header */}
      <div className="mb-3">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
        >
          Market
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Photography &amp; Listing</h2>
      <p className="text-gray-600 leading-relaxed mb-10">
        <span className="font-semibold text-gray-800">Why it matters:</span>{' '}
        95% of buyers start their search online. Your photos are your first showing — bad photos
        cost you offers before buyers ever walk through the door.
      </p>

      {/* Photography guidelines */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Before you pick up your phone 📸</h3>
        <p className="text-sm text-gray-500 mb-6">
          These make the difference between photos that get clicks and photos that get skipped.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {PHOTO_TIPS.map(({ emoji, text }) => (
            <div key={text} className="flex items-start gap-4 px-5 py-4">
              <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before photo wizard */}
      <section className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload your practice shots</h3>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll give you feedback on what to fix before the real shoot.
        </p>

        {!wizardDone ? (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Room {wizardStage + 1} of {WIZARD_STAGES.length}
                </span>
                <div className="flex gap-1.5">
                  {WIZARD_STAGES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-8 rounded-full transition-colors"
                      style={{ backgroundColor: i <= wizardStage ? ACCENT : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">{currentStage.label}</h4>
              <p className="text-sm text-gray-500">{currentStage.tip}</p>
            </div>
            <div className="px-6 py-5">
              <UploadZone
                photos={photos[currentStage.id]}
                onAdd={newPhotos => addPhotos(currentStage.id, newPhotos)}
                maxPhotos={currentStage.maxPhotos}
              />
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={advanceWizard}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  {currentStage.nextLabel}
                </button>
                <button
                  type="button"
                  onClick={advanceWizard}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-700 mb-5">
              {totalPhotos > 0
                ? `You uploaded ${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''} across ${uploadedRooms.length} room${uploadedRooms.length !== 1 ? 's' : ''}`
                : "No photos uploaded — that's okay, you can still move forward."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative">
                <button
                  type="button"
                  disabled
                  onMouseEnter={() => setShowAiTooltip(true)}
                  onMouseLeave={() => setShowAiTooltip(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-not-allowed opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  Get AI feedback →
                </button>
                {showAiTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg z-10 pointer-events-none">
                    AI feedback coming soon
                    <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={scrollToComplete}
                className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Skip AI feedback — continue
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mark complete */}
      <div ref={completeRef} className="pt-6 border-t border-gray-100">
        {isCompleted ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill={ACCENT} />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Done!
              </span>
              <button
                type="button"
                onClick={() => onComplete(false)}
                className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
              >
                Undo
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSelectStep && onSelectStep(5)}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Next up: Showings &amp; Open Houses →
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(true)}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Mark this step complete
          </button>
        )}
      </div>
    </div>
  )
}
