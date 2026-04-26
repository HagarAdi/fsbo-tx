import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function DrawerInner({ onClose, termName, whatItSays, whatItMeans, moneyTrail, txSellerTip }) {
  if (!termName) return null
  return (
    <div style={{ padding: '24px 24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', lineHeight: 1.35, paddingRight: '12px' }}>
          ⚖️ TREC Contract — {termName}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#9ca3af', lineHeight: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#6b7280', lineHeight: 1.55 }}>
        Explanation of common TREC terms. This is not legal advice. For specific contract questions, consult a Texas real estate attorney.
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
          What it says:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{whatItSays}</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
          What it means for you:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{whatItMeans}</p>
      </div>

      {moneyTrail && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
            💰 Money trail:
          </p>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{moneyTrail}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
          🏠 TX seller tip:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{txSellerTip}</p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '20px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <a
          href="https://www.trec.texas.gov/sites/default/files/pdf-forms/20-17.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          Download TREC 1-4 Family Residential Contract (PDF) →
        </a>
        <a
          href="https://trec.texas.gov"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          Visit TREC.texas.gov →
        </a>
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.55 }}>
        This is not legal advice. Consult a licensed Texas real estate attorney for specific guidance.
      </p>
    </div>
  )
}

export default function TRECDrawer({ isOpen, onClose, termName, whatItSays, whatItMeans, moneyTrail, txSellerTip }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 9998,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Desktop: slides in from right (768px+) */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          backgroundColor: 'white',
          zIndex: 9999,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease',
          overflowY: 'auto',
        }}
      >
        <DrawerInner
          onClose={onClose}
          termName={termName}
          whatItSays={whatItSays}
          whatItMeans={whatItMeans}
          moneyTrail={moneyTrail}
          txSellerTip={txSellerTip}
        />
      </div>

      {/* Mobile: slides up from bottom */}
      <div
        className="block md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60vh',
          backgroundColor: 'white',
          zIndex: 9999,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          borderRadius: '14px 14px 0 0',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms ease',
          overflowY: 'auto',
        }}
      >
        <DrawerInner
          onClose={onClose}
          termName={termName}
          whatItSays={whatItSays}
          whatItMeans={whatItMeans}
          moneyTrail={moneyTrail}
          txSellerTip={txSellerTip}
        />
      </div>
    </>,
    document.body
  )
}
