import Tooltip from './Tooltip'
import { Link } from 'react-router'
import IconButton from './IconButton'
import type { RowActionProps } from '../types/RowActionProps'
export default function RowAction({
  label,
  children,
  to,
  href,
  onClick,
  disabled,
  type = 'button',
  variant = 'ghost',
  hint,
}: RowActionProps) {
  const variants = {
    ghost: 'btn-ghost',
    primary: 'btn-primary',
    outline: 'btn-outline',
  }
  const className = `btn btn-sm btn-square ${variants[variant]}`
  if (to === undefined && href === undefined)
    return (
      <IconButton
        label={label}
        hint={hint}
        type={type}
        disabled={disabled}
        onClick={onClick}
        variant={variant}
      >
        {children}
      </IconButton>
    )
  return (
    <Tooltip label={hint ?? label}>
      {to !== undefined ? (
        <Link to={to} className={className} aria-label={label}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          aria-label={label}
        >
          {children}
        </a>
      )}
    </Tooltip>
  )
}
