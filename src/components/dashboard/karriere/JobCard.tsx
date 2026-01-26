'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { getImageUrl } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { JOB_STATUSES, EMPLOYMENT_TYPES } from '@/lib/constants/employment-types'

interface Job {
  id: string
  slug: string
  title: string
  company: string | null
  employmentType: string | null
  location: string | null
  featuredImage: string | null
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  applicationDeadline: string | null
  _count: {
    applications: number
  }
}

interface JobCardProps {
  job: Job
  onDelete: (id: string) => void
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const statusConfig = JOB_STATUSES.find((s) => s.value === job.status)
  const employmentLabel = EMPLOYMENT_TYPES.find((t) => t.value === job.employmentType)?.label || job.employmentType

  return (
    <div className="group relative rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Featured Image */}
      <div className="relative h-32 bg-light-grey">
        {job.featuredImage ? (
          <Image
            src={getImageUrl(job.featuredImage)}
            alt={job.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-text-color/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig?.color || ''}`}>
            {statusConfig?.label}
          </span>
        </div>

        {/* Applications Count Badge */}
        {job._count.applications > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-white">
              {job._count.applications} Bewerbung{job._count.applications !== 1 ? 'en' : ''}
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            href={`/karriere/${job.id}`}
            className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-text-color hover:bg-light-grey transition-colors"
          >
            Bearbeiten
          </Link>
          <Link
            href={`/karriere/bewerbungen?jobId=${job.id}`}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-white hover:bg-secondary/90 transition-colors"
          >
            Bewerbungen
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-color truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-text-color/60">
              {employmentLabel && <span>{employmentLabel}</span>}
              {employmentLabel && job.location && <span className="text-text-color/30">|</span>}
              {job.location && <span>{job.location}</span>}
            </div>
          </div>
          <button
            onClick={() => onDelete(job.id)}
            className="p-1.5 text-text-color/30 hover:text-red-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-light-grey text-xs text-text-color/50">
          <div>
            {job.publishedAt && (
              <span>Veröffentlicht: {format(new Date(job.publishedAt), 'dd.MM.yyyy', { locale: de })}</span>
            )}
          </div>
          {job.applicationDeadline && (
            <span>Frist: {format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: de })}</span>
          )}
        </div>
      </div>
    </div>
  )
}
