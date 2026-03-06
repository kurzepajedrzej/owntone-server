/**
 * Friendly display names for named pipes.
 * Key = pipe filename stem (what OwnTone uses as the track title).
 * Add entries here whenever you add a new pipe to the server.
 */
export const PIPE_NAMES = {
  'cd.pipe':   { title: 'CD Player', artist: 'Analog Input', album: '' },
  'ipod.pipe': { title: 'iPod',      artist: 'Analog Input', album: '' }
}

/**
 * If the queue item is a known named pipe, return overridden display fields.
 * Otherwise return the item unchanged.
 */
export function withFriendlyPipeName(item) {
  if (!item || item.data_kind !== 'pipe') return item
  const override = PIPE_NAMES[item.title]
  if (!override) return item
  return { ...item, ...override }
}
