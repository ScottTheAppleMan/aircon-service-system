// Labelled input wired up for screen readers: the label points at the input,
// and any error is announced and linked through aria-describedby.

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  placeholder,
  disabled = false,
}) {
  const errorId = `${id}-error`

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label auth-field__label">
        {label}
        {required && <span className="auth-field__required" aria-hidden="true"> *</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        className={`form-control${error ? ' is-invalid' : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {error && (
        <div id={errorId} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  )
}
