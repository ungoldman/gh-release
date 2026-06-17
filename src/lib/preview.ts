const columnWidth = 20

interface Column {
  column1: string
  column2: string
}

/** Print a human-readable summary of the release about to be created. */
export function preview(
  options: Record<string, unknown>,
  log: (msg: string) => void = console.log
): void {
  log(`\ncreating release ${options.tag_name} for ${options.owner}/${options.repo}\n`)
  for (const { column1, column2 } of formatOptions(options)) log(column1 + column2)
  log('')
}

function formatOptions(options: Record<string, unknown>): Column[] {
  const formatted: Column[] = []
  const copy = { ...options }
  for (const key of ['auth', 'owner', 'repo', 'dryRun', 'yes', 'workpath']) delete copy[key]

  for (const key of Object.keys(copy).reverse()) {
    if (['assets', 'draft', 'prerelease'].includes(key) && !copy[key]) continue
    if (key === 'body') {
      formatted.push(...formatBody(String(copy.body ?? '')))
    } else {
      formatted.push({ column1: justify(key), column2: String(copy[key]) })
    }
  }

  return formatted
}

function formatBody(body: string): Column[] {
  const arr: Column[] = [
    { column1: justify('body'), column2: '' },
    { column1: '', column2: '' }
  ]
  for (const line of body.split('\n')) arr.push({ column1: '', column2: line })
  return arr
}

function justify(word: string): string {
  let justified = `${word}:`
  while (justified.length < columnWidth) justified += ' '
  return justified
}
