import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..', '..')
const source = path.join(repoRoot, 'meiyiyang_resume.pdf')
const dest = path.join(repoRoot, 'mei-portfolio', 'public', 'resume.pdf')

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  const srcOk = await fileExists(source)
  if (!srcOk) {
    throw new Error(
      `Updated resume not found at ${source}\n` +
        `Place your latest PDF there (repo root) so it can be deployed as /resume.pdf.`,
    )
  }

  await fs.mkdir(path.dirname(dest), { recursive: true })

  const [srcStat, dstOk] = await Promise.all([
    fs.stat(source),
    fileExists(dest),
  ])

  if (dstOk) {
    const dstStat = await fs.stat(dest)
    if (dstStat.size === srcStat.size && dstStat.mtimeMs >= srcStat.mtimeMs) {
      return
    }
  }

  await fs.copyFile(source, dest)
}

await main()

