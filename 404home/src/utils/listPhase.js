/** @returns {'loading' | 'empty' | 'ready'} */
export function listPhase(loading, length) {
  if (loading) return 'loading'
  if (!length) return 'empty'
  return 'ready'
}
