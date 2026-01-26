'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { JobCard } from '@/components/dashboard/karriere/JobCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { toast } from 'sonner'
import { JOB_STATUSES } from '@/lib/constants/employment-types'

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

export default function KarrierePage() {
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchJobs = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/karriere?website=${website}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch {
      toast.error('Fehler beim Laden der Stellen')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const filteredJobs = useMemo(() => {
    let filtered = jobs

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === filterStatus)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [jobs, searchQuery, filterStatus])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/karriere/${deleteId}`, { method: 'DELETE' })
      setJobs((prev) => prev.filter((j) => j.id !== deleteId))
      toast.success('Stelle gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  // Count applications
  const totalApplications = jobs.reduce((acc, job) => acc + job._count.applications, 0)
  const newApplications = jobs.reduce((acc, job) => acc + job._count.applications, 0) // Simplified - would need status filter

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Karriere</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Verwalten Sie die Stellenangebote für {getDisplayName()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="internal"
            link="/karriere/bewerbungen"
            variant="secondary"
            className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white"
          >
            Bewerbungen {totalApplications > 0 && `(${totalApplications})`}
          </Button>
          <Button type="internal" link="/karriere/neu" variant="secondary">
            Neue Stelle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-color/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Stelle suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white shadow-sm text-sm text-text-color placeholder:text-text-color/40 focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {JOB_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-text-color/20"
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
          <p className="text-text-color/60 mt-4 mb-4">Keine Stellenangebote vorhanden.</p>
          <Button type="internal" link="/karriere/neu" variant="secondary">
            Erste Stelle erstellen
          </Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-text-color/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-text-color/60 mt-4">
            Keine Stellen gefunden
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stelle löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Stelle wirklich löschen? Alle zugehörigen Bewerbungen werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
