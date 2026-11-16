// Apply Codelo's theme preference before the first paint, using Nexora's own key.
try {
  document.documentElement.dataset.theme =
    localStorage.getItem('nexora-theme') === 'corporate' ? 'corporate' : 'black'
} catch {
  document.documentElement.dataset.theme = 'black'
}
