export function developerActivityReason(score: number, reason: string) {
 if (score !== 5) return 'El día laboral terminó sin un push o commits atribuidos registrados.'
 return reason === 'author_commit_recorded' ? 'Se registraron commits atribuidos a este desarrollador durante el día.' : 'Se registró un push verificado durante el día.'
}
