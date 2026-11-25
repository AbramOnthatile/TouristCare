const temporaryFiles = new Map()

export function storeTemporaryFile(id, file) {
  if (!id || !file) throw new Error('A demo file needs a valid reference before it can be kept for this page session.')
  temporaryFiles.set(id, file)
}

export function getTemporaryFile(id) {
  return temporaryFiles.get(id) || null
}

export function removeTemporaryFile(id) {
  temporaryFiles.delete(id)
}

export function clearTemporaryFiles() {
  temporaryFiles.clear()
}
