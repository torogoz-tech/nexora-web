import Tooltip from './Tooltip'
import type { IconButtonProps } from '../types/IconButtonProps'
export default function IconButton({
  label,
  hint,
  type = 'button',
  variant = 'ghost',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const variants = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    outline: 'btn-outline',
    error: 'btn-error',
  }
  return (
    <Tooltip label={hint ?? label} className={className.replace(/tooltip(?:-\w+)?/g,'')}>
      <button
        {...props}
        type={type}
        aria-label={label}
        className={`btn btn-sm btn-square relative ${variants[variant]}`}
      >
        {props['aria-busy'] === true ? (
          <span
            className="loading loading-spinner loading-xs motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    </Tooltip>
  )
}
