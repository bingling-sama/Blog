/** Shared by the content loader, page compiler, RSS and notification script. */
export function getExternalPost(frontmatter, filePath) {
  if (!Object.hasOwn(frontmatter, "externalLink")) return {}

  const fail = (field, reason) => {
    throw new Error(`${filePath}: ${field} ${reason}`)
  }
  const value = frontmatter.externalLink
  if (typeof value !== "string" || !value.trim()) {
    fail("externalLink", "must be a non-empty absolute HTTP(S) URL")
  }
  const externalLink = value.trim()
  let parsed
  try {
    parsed = new URL(externalLink)
  } catch {
    fail("externalLink", "must be an absolute HTTP(S) URL")
  }
  if (
    !/^https?:\/\//i.test(externalLink) ||
    [...externalLink].some(
      (char) => char.charCodeAt(0) <= 0x20 || char.charCodeAt(0) === 0x7f
    ) ||
    !["http:", "https:"].includes(parsed.protocol) ||
    !parsed.hostname ||
    parsed.username ||
    parsed.password
  ) {
    fail("externalLink", "must be an absolute HTTP(S) URL without credentials")
  }
  for (const field of ["title", "description"]) {
    if (typeof frontmatter[field] !== "string" || !frontmatter[field].trim()) {
      fail(field, "must be a non-empty string for an external post")
    }
  }
  if (
    !(
      typeof frontmatter.date === "string" || frontmatter.date instanceof Date
    ) ||
    !Number.isFinite(new Date(frontmatter.date).getTime())
  ) {
    fail("date", "must be a valid recommendation date")
  }
  if (
    frontmatter.sourceAuthor != null &&
    typeof frontmatter.sourceAuthor !== "string"
  ) {
    fail("sourceAuthor", "must be a string")
  }
  return {
    externalLink,
    sourceAuthor: frontmatter.sourceAuthor?.trim() || undefined
  }
}

export function getPostLink(post, withBase = (url) => url) {
  return post.externalLink
    ? { href: post.externalLink, target: "_blank", rel: "noopener noreferrer" }
    : { href: withBase(post.url) }
}

export function recommendationTitle(title) {
  return `[推荐阅读] ${title}`
}
