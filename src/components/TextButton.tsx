import type { TextButtonProps } from '../types/TextButtonProps'
export default function TextButton({
  label,
  variant = 'ghost',
  className = '',
  children,
  ...props
}: TextButtonProps) {
  const variants = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    outline: 'btn-outline',
    error: 'btn-error',
  }
  return (
    <button
      {...props}
      className={`btn btn-sm relative h-auto min-h-8 whitespace-normal py-2 ${variants[variant]} ${className}`}
    >
      {props['aria-busy'] === true ? (
        <span
          className="loading loading-spinner loading-xs motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : children ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {children}
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  )
}
