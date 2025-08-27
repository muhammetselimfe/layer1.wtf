import React from 'react'

interface ErrorDialogProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  linkUrl?: string
  linkText?: string
}

export function ErrorDialog({ isVisible, onClose, title, message, linkUrl, linkText }: ErrorDialogProps) {
  if (!isVisible) return null

  return (
    <div className="error-overlay">
      <div className="error-dialog">
        <div className="error-title-bar">
          <span className="error-title">{title}</span>
          <button className="error-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="error-content">
          <div className="error-icon">⚠</div>
          <div className="error-message">
            {message}
            {linkUrl && linkText && (
              <>
                {' '}
                <a 
                  href={linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="error-link"
                >
                  {linkText}
                </a>
                !
              </>
            )}
          </div>
        </div>
        <div className="error-buttons">
          <button className="error-ok-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}