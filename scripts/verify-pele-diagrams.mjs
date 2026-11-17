import { readFile } from "node:fs/promises"
import { readdir } from "node:fs/promises"
import { render } from "pele"

const collectMarkdownFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`
      return entry.isDirectory() ? collectMarkdownFiles(path) : path
    })
  )
  return nested.flat().filter((file) => file.endsWith(".md"))
}

const files = await collectMarkdownFiles("blog")
const diagrams = []

for (const file of files) {
  const markdown = await readFile(file, "utf8")
  const blocks = markdown.matchAll(/```(?:mermaid|mmd)\s*\n([\s\S]*?)```/g)

  for (const match of blocks) {
    diagrams.push({ file, source: match[1].trim() })
  }
}

const failures = []

for (const [index, diagram] of diagrams.entries()) {
  try {
    const result = render(diagram.source, {
      idPrefix: `verify-${index}`,
      links: false,
      images: false
    })

    if (!result.svg.startsWith("<svg")) {
      throw new Error("Pele returned a non-SVG result")
    }
  } catch (error) {
    failures.push({
      file: diagram.file,
      message: error instanceof Error ? error.message : String(error)
    })
  }
}

console.log(`Verified ${diagrams.length} Pele diagrams.`)

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.message}`)
  }
  process.exitCode = 1
}
