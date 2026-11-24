const TOOL_DISCOVERY = new Set(['home', 'category', 'search', 'tool-detail'])

/**
 * Whether the tool CategoryNav should render for this route.
 * @param {string} routeName
 * @param {{ navOpen?: boolean }} [opts]
 */
export function shouldShowCategoryNav(routeName, opts = {}) {
  if (opts.navOpen) return false
  return TOOL_DISCOVERY.has(routeName)
}
