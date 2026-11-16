import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { useState } from 'react'
import { Pause, Play } from 'lucide-react'

export default function CodeCloud() {
  const { t } = useTranslation()
  const [paused, setPaused] = useState(false)
  const symbols = [
    {
      text: '<>',
      x: '8%',
      y: '16%',
      size: 'clamp(2rem, 5vw, 4.5rem)',
      rotation: '-14deg',
      duration: '29s',
      delay: '-9s',
      opacity: 0.11,
    },
    {
      text: '{ }',
      x: '24%',
      y: '9%',
      size: 'clamp(1.5rem, 3vw, 2.75rem)',
      rotation: '12deg',
      duration: '34s',
      delay: '-18s',
      opacity: 0.07,
    },
    {
      text: ';',
      x: '84%',
      y: '13%',
      size: 'clamp(2.5rem, 6vw, 5.5rem)',
      rotation: '10deg',
      duration: '32s',
      delay: '-5s',
      opacity: 0.1,
    },
    {
      text: '</>',
      x: '72%',
      y: '28%',
      size: 'clamp(1.5rem, 4vw, 3.5rem)',
      rotation: '-9deg',
      duration: '36s',
      delay: '-22s',
      opacity: 0.1,
    },
    {
      text: '=>',
      x: '14%',
      y: '43%',
      size: 'clamp(1.75rem, 3vw, 3rem)',
      rotation: '8deg',
      duration: '31s',
      delay: '-14s',
      opacity: 0.08,
    },
    {
      text: '[ ]',
      x: '89%',
      y: '44%',
      size: 'clamp(1.5rem, 3vw, 2.75rem)',
      rotation: '16deg',
      duration: '38s',
      delay: '-27s',
      opacity: 0.08,
    },
    {
      text: '{}',
      x: '5%',
      y: '68%',
      size: 'clamp(2rem, 6vw, 5rem)',
      rotation: '-8deg',
      duration: '35s',
      delay: '-21s',
      opacity: 0.1,
    },
    {
      text: '&&',
      x: '23%',
      y: '75%',
      size: 'clamp(1.25rem, 2.5vw, 2.25rem)',
      rotation: '12deg',
      duration: '30s',
      delay: '-3s',
      opacity: 0.06,
    },
    {
      text: '( )',
      x: '75%',
      y: '65%',
      size: 'clamp(1.5rem, 4vw, 3.5rem)',
      rotation: '-12deg',
      duration: '33s',
      delay: '-16s',
      opacity: 0.09,
    },
    {
      text: '++',
      x: '88%',
      y: '81%',
      size: 'clamp(1.5rem, 3vw, 2.5rem)',
      rotation: '7deg',
      duration: '37s',
      delay: '-24s',
      opacity: 0.06,
    },
    {
      text: '/**/',
      x: '41%',
      y: '82%',
      size: 'clamp(1.25rem, 3vw, 2.75rem)',
      rotation: '-6deg',
      duration: '39s',
      delay: '-12s',
      opacity: 0.06,
    },
    {
      text: '::',
      x: '60%',
      y: '72%',
      size: 'clamp(1.5rem, 3vw, 3rem)',
      rotation: '14deg',
      duration: '28s',
      delay: '-20s',
      opacity: 0.07,
    },
    {
      text: '#',
      x: '32%',
      y: '53%',
      size: 'clamp(1.5rem, 2.5vw, 2.25rem)',
      rotation: '-13deg',
      duration: '40s',
      delay: '-7s',
      opacity: 0.05,
    },
    {
      text: '!=',
      x: '65%',
      y: '10%',
      size: 'clamp(1.25rem, 2.5vw, 2rem)',
      rotation: '9deg',
      duration: '34s',
      delay: '-26s',
      opacity: 0.06,
    },
    {
      text: '...',
      x: '11%',
      y: '91%',
      size: 'clamp(1.5rem, 4vw, 3.25rem)',
      rotation: '-9deg',
      duration: '32s',
      delay: '-11s',
      opacity: 0.07,
    },
    {
      text: '< />',
      x: '64%',
      y: '92%',
      size: 'clamp(1.25rem, 3vw, 2.5rem)',
      rotation: '11deg',
      duration: '36s',
      delay: '-19s',
      opacity: 0.06,
    },
  ]

  return (
    <>
      <div
        className={`code-cloud ${paused ? 'code-cloud-paused' : ''}`}
        aria-hidden="true"
      >
        {symbols.map((symbol) => (
          <span
            key={symbol.text}
            className="code-cloud-symbol"
            style={{
              left: symbol.x,
              top: symbol.y,
              fontSize: symbol.size,
              rotate: symbol.rotation,
              animationDuration: symbol.duration,
              animationDelay: symbol.delay,
              opacity: symbol.opacity,
            }}
          >
            {symbol.text}
          </span>
        ))}
      </div>
      <IconButton
        type="button"
        variant="ghost"
        className="code-cloud-toggle absolute top-4 right-16"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
        label={paused ? t('Reanudar fondo animado') : t('Pausar fondo animado')}
      >
        {paused ? (
          <Play size={16} aria-hidden="true" />
        ) : (
          <Pause size={16} aria-hidden="true" />
        )}
      </IconButton>
    </>
  )
}
