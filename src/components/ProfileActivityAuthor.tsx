import { Link } from 'react-router'
import type { ProfileActivityAuthor as Author } from '../types/ProfileActivityAuthor'
import UserAvatar from './UserAvatar'

export default function ProfileActivityAuthor({ author }: { author: Author }) {
  const identity = <><UserAvatar actorId={author.id ?? undefined} revision={author.avatar_revision} name={author.name}/><span className="min-w-0"><span className="block break-words text-sm font-medium">{author.name}</span>{author.position && <span className="block break-words text-xs text-base-content/55">{author.position}</span>}</span></>
  return author.id
    ? <Link className="mt-2 flex w-fit items-center gap-2 hover:underline" to={`/settings/members/${encodeURIComponent(author.id)}`}>{identity}</Link>
    : <div className="mt-2 flex items-center gap-2">{identity}</div>
}
