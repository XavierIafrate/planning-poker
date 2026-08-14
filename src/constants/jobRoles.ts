import type { JobRole } from '@/types/room'

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  dev: 'Dev',
  qa: 'QA',
  product: 'Product',
}

export const DEFAULT_JOB_ROLE: JobRole = 'dev'
