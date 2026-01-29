'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
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
import { toast } from 'sonner'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { APPLICATION_STATUSES } from '@/lib/constants/employment-types'

interface Certificate {
  url: string
  name: string
}

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  coverMessage: string | null
  cvUrl: string | null
  cvOriginalName: string | null
  coverLetterUrl: string | null
  coverLetterOriginalName: string | null
  certificates: Certificate[]
  status: 'new' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected'
  notes: string | null
  createdAt: string
  updatedAt: string
  job: {
    id: string
    title: string
    slug: string
    website: string
  }
}

export default function BewerbungDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getDisplayName } = useWebsite()
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch(`/api/karriere/bewerbungen/${id}`)
        if (!res.ok) {
          toast.error('Bewerbung nicht gefunden')
          router.push('/karriere/bewerbungen')
          return
        }

        const data = await res.json()
        setApplication(data)
        setNotes(data.notes || '')
      } catch {
        toast.error('Fehler beim Laden der Bewerbung')
        router.push('/karriere/bewerbungen')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchApplication()
  }, [id, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return
    try {
      const res = await fetch(`/api/karriere/bewerbungen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setApplication((prev) => prev ? { ...prev, status: newStatus as Application['status'] } : null)
      toast.success('Status aktualisiert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/karriere/bewerbungen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error()
      setApplication((prev) => prev ? { ...prev, notes } : null)
      toast.success('Notizen gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/karriere/bewerbungen/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Bewerbung gelöscht')
      router.push('/karriere/bewerbungen')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const getStatusConfig = (status: string) => {
    return APPLICATION_STATUSES.find((s) => s.value === status)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return null
  }

  const statusConfig = getStatusConfig(application.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/karriere/bewerbungen"
            className="p-2 rounded-lg hover:bg-light-grey text-text-color/60 hover:text-text-color"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-color">
                {application.firstName} {application.lastName}
              </h1>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig?.color || ''}`}>
                {statusConfig?.label}
              </span>
            </div>
            <p className="text-sm text-text-color/60 mt-1">
              Bewerbung für: {application.job.title}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-2 text-text-color/30 hover:text-red-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Kontaktdaten</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-text-color/60">Name</Label>
                <p className="mt-1 text-text-color font-medium">
                  {application.firstName} {application.lastName}
                </p>
              </div>
              <div>
                <Label className="text-text-color/60">E-Mail</Label>
                <p className="mt-1">
                  <a
                    href={`mailto:${application.email}`}
                    className="text-secondary hover:text-secondary/80"
                  >
                    {application.email}
                  </a>
                </p>
              </div>
              {application.phone && (
                <div>
                  <Label className="text-text-color/60">Telefon</Label>
                  <p className="mt-1">
                    <a
                      href={`tel:${application.phone}`}
                      className="text-secondary hover:text-secondary/80"
                    >
                      {application.phone}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <Label className="text-text-color/60">Eingegangen</Label>
                <p className="mt-1 text-text-color">
                  {format(new Date(application.createdAt), "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                </p>
              </div>
            </div>
          </div>

          {/* Cover Message */}
          {application.coverMessage && (
            <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
              <h2 className="font-medium text-text-color">Anschreiben</h2>
              <div className="prose prose-sm max-w-none text-text-color/80 whitespace-pre-wrap">
                {application.coverMessage}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Anlagen</h2>
            <div className="space-y-3">
              {/* CV */}
              {application.cvUrl ? (
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-light-grey hover:bg-light-grey/80 transition-colors"
                >
                  <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-color">Lebenslauf</p>
                    <p className="text-xs text-text-color/60 truncate">
                      {application.cvOriginalName || 'Datei herunterladen'}
                    </p>
                  </div>
                  <svg className="h-4 w-4 text-text-color/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-light-grey text-text-color/40">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm">Kein Lebenslauf hochgeladen</span>
                </div>
              )}

              {/* Cover Letter */}
              {application.coverLetterUrl ? (
                <a
                  href={application.coverLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-light-grey hover:bg-light-grey/80 transition-colors"
                >
                  <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-color">Anschreiben (Datei)</p>
                    <p className="text-xs text-text-color/60 truncate">
                      {application.coverLetterOriginalName || 'Datei herunterladen'}
                    </p>
                  </div>
                  <svg className="h-4 w-4 text-text-color/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              ) : null}

              {/* Certificates */}
              {application.certificates && application.certificates.length > 0 && (
                <>
                  <div className="pt-2">
                    <Label className="text-text-color/60">Zeugnisse & Zertifikate</Label>
                  </div>
                  {application.certificates.map((cert, index) => (
                    <a
                      key={index}
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-light-grey hover:bg-light-grey/80 transition-colors"
                    >
                      <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-color truncate">{cert.name}</p>
                      </div>
                      <svg className="h-4 w-4 text-text-color/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </a>
                  ))}
                </>
              )}

              {!application.cvUrl && !application.coverLetterUrl && (!application.certificates || application.certificates.length === 0) && (
                <p className="text-sm text-text-color/50 py-2">Keine Anlagen vorhanden</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Interne Notizen</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen zur Bewerbung hinzufügen..."
              rows={4}
              className="resize-none"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? 'Speichern...' : 'Notizen speichern'}
            </Button>
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Status</h2>
            <Select value={application.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Auswählen" />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Info */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Stelle</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-color">{application.job.title}</p>
              <Link
                href={`/karriere/${application.job.id}`}
                className="inline-flex items-center gap-1 text-sm text-secondary hover:text-secondary/80"
              >
                Stelle ansehen
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl bg-white shadow-sm space-y-4">
            <h2 className="font-medium text-text-color">Aktionen</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${application.email}?subject=Ihre Bewerbung als ${application.job.title}`}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-text-color bg-light-grey rounded-lg hover:bg-light-grey/80 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                E-Mail senden
              </a>
              {application.phone && (
                <a
                  href={`tel:${application.phone}`}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-text-color bg-light-grey rounded-lg hover:bg-light-grey/80 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Anrufen
                </a>
              )}
            </div>
          </div>

          {/* Back Button */}
          <Button
            type="internal"
            link="/karriere/bewerbungen"
            variant="secondary"
            className="w-full bg-transparent border border-text-color/20 text-text-color hover:bg-light-grey"
          >
            Zurück zur Übersicht
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Bewerbung von {application.firstName} {application.lastName} wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
