// Shown while a page waits on its first request.

export default function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="loading-block" role="status">
      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      {label}
    </div>
  )
}
