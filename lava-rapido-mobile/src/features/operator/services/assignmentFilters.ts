import type { Assignment, AssignmentStatus } from '../../../services/assignmentService'

export type AssignmentFilter = 'all' | 'assigned' | 'inProgress' | 'completed'

const filterStatuses: Record<AssignmentFilter, AssignmentStatus[] | null> = {
  all: null,
  assigned: ['asignada'],
  inProgress: ['en_proceso'],
  completed: ['completada'],
}

export function getFilteredAssignments(
  assignments: Assignment[],
  filter: AssignmentFilter,
): Assignment[] {
  const latestByReservation = new Map<string, Assignment>()
  for (const assignment of assignments) {
    const existing = latestByReservation.get(assignment.idReserva)
    const assignmentDate = Date.parse(assignment.updatedAt || assignment.createdAt)
    const existingDate = existing
      ? Date.parse(existing.updatedAt || existing.createdAt)
      : Number.NEGATIVE_INFINITY
    if (!existing || assignmentDate >= existingDate) {
      latestByReservation.set(assignment.idReserva, assignment)
    }
  }

  const statuses = filterStatuses[filter]
  return [...latestByReservation.values()].filter((assignment) =>
    statuses === null ? true : statuses.includes(assignment.estado),
  )
}
