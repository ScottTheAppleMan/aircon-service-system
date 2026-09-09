import React, { useEffect, useState } from 'react'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024

function PhotoUploadField({ id, label, description, file, onChange }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setError('Choose a valid image file.')
      return
    }

    if (selectedFile.size > MAX_PHOTO_SIZE) {
      setError('Choose an image smaller than 10 MB.')
      return
    }

    setError('')
    onChange(selectedFile)
  }

  const removePhoto = () => {
    setError('')
    onChange(null)
  }

  return (
    <div className="photo-evidence-field">
      <div className="photo-evidence-copy">
        <label className="report-label" htmlFor={id}>
          {label}
        </label>
        <span>{description}</span>
      </div>

      {previewUrl ? (
        <div className="photo-preview">
          <img src={previewUrl} alt={`${label} preview`} />
          <div className="photo-preview-footer">
            <span title={file.name}>{file.name}</span>
            <button type="button" onClick={removePhoto}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="photo-upload-dropzone" htmlFor={id}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 15l-5-5L5 19" />
          </svg>
          <span>Choose photo</span>
          <small>JPG, PNG or HEIC · up to 10 MB</small>
        </label>
      )}

      <input
        id={id}
        className="photo-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {error && <span className="report-field-error">{error}</span>}
    </div>
  )
}

function PhotoEvidenceUpload({ beforePhoto, afterPhoto, onBeforeChange, onAfterChange }) {
  return (
    <section className="report-section" aria-labelledby="photo-evidence-title">
      <div className="report-section-heading">
        <div>
          <h3 id="photo-evidence-title">Before / After Service Evidence</h3>
          <p>Add optional photos for visual service documentation. Photos remain in this browser only.</p>
        </div>
      </div>

      <div className="photo-evidence-grid">
        <PhotoUploadField
          id="before-service-photo"
          label="Before-service photo"
          description="Capture the unit condition before work begins."
          file={beforePhoto}
          onChange={onBeforeChange}
        />
        <PhotoUploadField
          id="after-service-photo"
          label="After-service photo"
          description="Capture the completed service condition."
          file={afterPhoto}
          onChange={onAfterChange}
        />
      </div>
    </section>
  )
}

export default PhotoEvidenceUpload
