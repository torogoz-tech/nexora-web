export function playNotificationSound(context: AudioContext) {
  const start = context.currentTime
  const gain = context.createGain()
  const tone = context.createOscillator()
  tone.type = 'sine'
  tone.frequency.setValueAtTime(784, start)
  tone.frequency.setValueAtTime(1046, start + 0.12)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.075, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.36)
  tone.connect(gain)
  gain.connect(context.destination)
  tone.onended = () => { tone.disconnect(); gain.disconnect() }
  tone.start(start)
  tone.stop(start + 0.38)
}
