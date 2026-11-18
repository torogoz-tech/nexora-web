import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { getDropdownPosition } from '../utils/getDropdownPosition'
import type { DropdownProps } from '../types/DropdownProps'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}

export default function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false,
  name,
  className = 'w-full',
  searchable,
}: DropdownProps) {
  const { t } = useTranslation()
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [search, setSearch] = useState('')
  const [position, setPosition] =
    useState<ReturnType<typeof getDropdownPosition>>()
  const keyboardOpening = useRef(false)
  const typed = useRef({ value: '', time: 0 })
  const isSearchable = searchable ?? options.length > 8
  const normalizedSearch = normalize(search.trim())
  const visibleOptions = normalizedSearch
    ? options.filter((option) => normalize(option.label).includes(normalizedSearch))
    : options
  const selected = options.find((option) => option.value === value)

  function positionMenu() {
    if (trigger.current)
      setPosition(
        getDropdownPosition(
          trigger.current.getBoundingClientRect(),
          window.innerWidth,
          window.innerHeight,
          menu.current?.scrollHeight || Math.min(options.length * 36 + 12, 240),
        ),
      )
  }

  function items() {
    return Array.from(
      menu.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]:not(:disabled)',
      ) ?? [],
    )
  }

  function focusItem(index: number) {
    const all = items()
    const item = all[index]
    if (item) {
      item.focus({ preventScroll: true })
      const list = menu.current?.querySelector<HTMLElement>('[data-options-list]')
      if (list)
        list.scrollTop = Math.max(0, item.offsetTop - list.clientHeight / 2)
    }
  }

  function close(restore = false) {
    menu.current?.hidePopover()
    if (restore) trigger.current?.focus()
  }

  useEffect(() => {
    if (disabled) menu.current?.hidePopover()
  }, [disabled])

  useEffect(() => {
    if (!open) return
    const dismiss = (event: Event) => {
      if (
        event.type === 'scroll' &&
        event.target instanceof Node &&
        menu.current?.contains(event.target)
      )
        return
      menu.current?.hidePopover()
    }
    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [open])

  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const expanded = menu.current?.matches(':popover-open') ?? false
    const all = items()
    const current = all.indexOf(document.activeElement as HTMLButtonElement)
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (!expanded) {
        const selectedIndex = all.findIndex(
          (item) => item.dataset.value === value,
        )
        const index =
          event.key === 'End' || (event.key === 'ArrowUp' && selectedIndex < 0)
            ? all.length - 1
            : event.key === 'Home'
              ? 0
              : Math.max(0, selectedIndex)
        keyboardOpening.current = true
        positionMenu()
        menu.current?.showPopover()
        focusItem(index)
      } else if (isSearchable && event.target === searchInput.current) {
        focusItem(event.key === 'ArrowUp' || event.key === 'End' ? all.length - 1 : 0)
      } else {
        focusItem(
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? all.length - 1
              : (current + (event.key === 'ArrowUp' ? -1 : 1) + all.length) %
                all.length,
        )
      }
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (event.key === 'Tab' && expanded) {
      close()
    } else if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      if (isSearchable && expanded) return
      event.preventDefault()
      const now = Date.now()
      typed.current = {
        value:
          (now - typed.current.time < 700 ? typed.current.value : '') +
          event.key.toLocaleLowerCase(),
        time: now,
      }
      const matching = all.findIndex((item) =>
        item.textContent?.trim().toLocaleLowerCase().startsWith(typed.current.value),
      )
      if (matching >= 0) {
        if (!expanded) {
          keyboardOpening.current = true
          positionMenu()
          menu.current?.showPopover()
        }
        focusItem(matching)
      }
    }
  }

  return (
    <div className={`min-w-0 ${className}`} onKeyDown={keys}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        popoverTarget={id}
        disabled={disabled}
        onClick={() => {
          keyboardOpening.current = false
          setSearch('')
          positionMenu()
        }}
        className="input input-sm flex w-full cursor-pointer items-center justify-between gap-3 font-normal disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`truncate ${!selected || selected.disabled ? 'text-base-content/45' : ''}`}
        >
          {selected?.label ?? t(placeholder)}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="shrink-0 text-base-content/50"
        />
      </button>
      <div
        ref={menu}
        id={id}
        popover="auto"
        role="presentation"
        className="m-0 overflow-hidden rounded-xl border border-base-300 bg-base-200 p-1.5 text-base-content shadow-xl"
        style={position}
        onToggle={(event) => {
          const showing = event.currentTarget.matches(':popover-open')
          setOpen(showing)
          if (showing) {
            positionMenu()
            const all = items()
            const selectedIndex = all.findIndex(
              (item) => item.dataset.value === value,
            )
            if (!keyboardOpening.current && isSearchable)
              searchInput.current?.focus({ preventScroll: true })
            else if (!keyboardOpening.current)
              focusItem(Math.max(0, selectedIndex))
            keyboardOpening.current = false
          } else {
            setSearch('')
          }
        }}
      >
        {isSearchable && (
          <label className="input input-sm mb-1 flex w-full items-center gap-2">
            <Search size={14} aria-hidden="true" />
            <input
              ref={searchInput}
              aria-label={t('Buscar opciones')}
              placeholder={t('Buscar opciones…')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  event.stopPropagation()
                  close(true)
                }
              }}
            />
          </label>
        )}
        <div
          role="listbox"
          aria-label={label}
          data-options-list
          className="max-h-56 overflow-y-auto overscroll-contain"
        >
          {visibleOptions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-base-content/50">
              {options.length === 0
                ? t('No hay opciones disponibles.')
                : t('No hay resultados.')}
            </p>
          ) : (
            visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                data-value={option.value}
                tabIndex={-1}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-base-300 focus-visible:bg-base-300 disabled:cursor-not-allowed disabled:text-base-content/35 ${option.value === value ? 'bg-base-300 font-medium' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setInvalid(false)
                  close(true)
                }}
              >
                <span className="min-w-0 break-words">{option.label}</span>
                {option.value === value && (
                  <Check size={14} aria-hidden="true" className="shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
      {required ? (
        <input
          className="sr-only"
          type="text"
          name={name}
          value={value}
          required
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
          onInvalid={(event) => {
            event.preventDefault()
            setInvalid(true)
            trigger.current?.focus()
          }}
        />
      ) : name ? (
        <input type="hidden" name={name} value={value} />
      ) : null}
      {invalid && (
        <span
          id={`${id}-error`}
          role="alert"
          className="mt-1 block text-xs text-error"
        >
          {t('Selecciona una opción.')}
        </span>
      )}
    </div>
  )
}
