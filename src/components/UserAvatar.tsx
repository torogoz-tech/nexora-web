import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react'
import { useMemberAvatar } from '../hooks/useMemberAvatar'
import { UserRound } from 'lucide-react'
import type { UserAvatarProps } from '../types/UserAvatarProps'

export default function UserAvatar({ name, imageUrl, actorId, revision }: UserAvatarProps) {
  const { t } = useTranslation()
  const storedImage = useMemberAvatar(imageUrl ? undefined : actorId,revision)
  imageUrl = imageUrl ?? storedImage
  const [failedImage, setFailedImage] = useState<string>()
  const label = name
    ? t('Avatar de {0}', { '0': name })
    : t('Avatar de usuario, sin sesión')
  return (
    <div className="avatar" title={label}>
      <div className="flex! size-9 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-200 text-base-content/60">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
            onError={() => setFailedImage(imageUrl)}
          />
        ) : (
          <span role="img" aria-label={label}>
            <UserRound size={19} aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}
