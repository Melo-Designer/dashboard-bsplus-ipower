'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Badge } from '@/components/ui/Badge'
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
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { APPLICATION_STATUSES } from '@/lib/constants/employment-types'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: 'new' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected'
  createdAt: string
  job: {
    id: string
    title: string
    slug: string
  }
}

interface Job {
  id: string
  title: string
  slug: string
}

function BewerbungenContent() {
  const searchParams = useSearchParams()
  const jobIdParam = searchParams.get('jobId')
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterJob, setFilterJob] = useState<string>(jobIdParam || 'all')

  const fetchData = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        fetch(`/api/karriere/bewerbungen?website=${website}`),
        fetch(`/api/karriere?website=${website}`),
      ])
      const applicationsData = await applicationsRes.json()
      const jobsData = await jobsRes.json()
      setApplications(applicationsData.applications || [])
      setJobs(jobsData.jobs || [])
    } catch {
      toast.error('Fehler beim Laden der Bewerbungen')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded])

  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((app) => app.status === filterStatus)
    }

    // Filter by job
    if (filterJob !== 'all') {
      filtered = filtered.filter((app) => app.job.id === filterJob)
    }

    return filtered
  }, [applications, filterStatus, filterJob])

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await fetch(`/api/karriere/bewerbungen/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus as Application['status'] } : app
        )
      )
      toast.success('Status aktualisiert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/karriere/bewerbungen/${deleteId}`, { method: 'DELETE' })
      setApplications((prev) => prev.filter((a) => a.id !== deleteId))
      toast.success('Bewerbung gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
  }

  const getStatusConfig = (status: string) => {
    return APPLICATION_STATUSES.find((s) => s.value === status)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/karriere"
            className="p-2 rounded-lg hover:bg-light-grey text-text-color/60 hover:text-text-color"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-color">Bewerbungen</h1>
            <p className="text-sm text-text-color/60 mt-1">
              Verwalten Sie die Bewerbungen für {getDisplayName()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Filter */}
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Stelle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stellen</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-text-color/60 mt-4">Keine Bewerbungen vorhanden.</p>
        </div>
      ) : filteredApplications.length === 0 ? (
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
          <p className="text-text-color/60 mt-4">Keine Bewerbungen gefunden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((application) => {
            const statusConfig = getStatusConfig(application.status)
            return (
              <div
                key={application.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-text-color">
                      {application.firstName} {application.lastName}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig?.color || ''}`}>
                      {statusConfig?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-text-color/60">
                    <span>{application.email}</span>
                    {application.phone && (
                      <>
                        <span className="text-text-color/30">|</span>
                        <span>{application.phone}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-color/50">
                    <span>Stelle: {application.job.title}</span>
                    <span className="text-text-color/30">|</span>
                    <span>Eingegangen: {format(new Date(application.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusChange(application.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Link
                    href={`/karriere/bewerbungen/${application.id}`}
                    className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-secondary/80"
                  >
                    Ansehen
                  </Link>

                  <button
                    onClick={() => setDeleteId(application.id)}
                    className="p-2 text-text-color/30 hover:text-red-600 transition-colors"
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
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Bewerbung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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

export default function BewerbungenPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <BewerbungenContent />
    </Suspense>
  )
}
