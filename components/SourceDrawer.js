import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function DrawerInner({ onClose, source }) {
  if (!source) return null
  return (
    <div style={{ padding: '24px 24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', lineHeight: 1.35, paddingRight: '12px' }}>
          {source.title} {source.year}
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

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
          Key finding:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{source.keyFinding}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '6px' }}>
          Why it matters for TX sellers:
        </p>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65 }}>{source.whyItMatters}</p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '20px' }} />

      <a
        href={source.fullReportUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', textDecoration: 'underline', textUnderlineOffset: '2px' }}
      >
        Read the full report →
      </a>

      <p style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
        Data cited for informational purposes only
      </p>
    </div>
  )
}

export default function SourceDrawer({ isOpen, onClose, source }) {
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
        <DrawerInner onClose={onClose} source={source} />
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
        <DrawerInner onClose={onClose} source={source} />
      </div>
    </>,
    document.body
  )
}
