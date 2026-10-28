import { getPageItems } from './paginationItems'

test.each([
  [0, 0, []],
  [1, 0, [1]],
  [2, 0, [1, 2]],
  [3, 1, [1, 2, 3]],
  [5, 4, [1, 2, 3, 4, 5]],
  [6, 0, [1, 2, 3, 4, 'ellipsis', 6]],
  [12, 0, [1, 2, 3, 4, 'ellipsis', 12]],
  [12, 5, [1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]],
  [12, 11, [1, 'ellipsis', 9, 10, 11, 12]],
  [101, 50, [1, 'ellipsis', 50, 51, 52, 'ellipsis', 101]],
] as const)('builds page items for %i pages at index %i', (total, current, expected) => {
  expect(getPageItems(total, current)).toEqual(expected)
})
