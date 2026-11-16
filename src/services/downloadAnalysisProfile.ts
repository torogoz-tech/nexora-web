import type { AnalysisProfilePackage } from '../types/AnalysisProfilePackage'
export function downloadAnalysisProfile(pack: AnalysisProfilePackage) {
 const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' })
 const url = URL.createObjectURL(blob), link = document.createElement('a')
 link.href = url
 const slug = pack.key.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 128)
 link.download = `${slug}-${pack.version.replace(/[^0-9.]/g, '_')}.nexora-profile.json`
 link.click()
 setTimeout(() => URL.revokeObjectURL(url), 0)
}
