export type PageItem = number | 'ellipsis'

export function getPageItems(totalPages: number, currentPage: number): PageItem[] {
  if (totalPages <= 0) return []
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const current = Math.min(Math.max(currentPage, 0), totalPages - 1)
  if (current <= 2) return [1, 2, 3, 4, 'ellipsis', totalPages]
  if (current >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'ellipsis', current, current + 1, current + 2, 'ellipsis', totalPages]
}
