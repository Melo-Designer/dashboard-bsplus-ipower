'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  company: string | null
  read: boolean
  archived: boolean
  createdAt: string
}

type FilterType = 'all' | 'unread' | 'archived'

// Email validation helper
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function NachrichtenPage() {
  const { website, isLoaded, getDisplayName } = useWebsite()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [counts, setCounts] = useState({ total: 0, unread: 0, archived: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Email notification settings
  const [notificationEmails, setNotificationEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [isSavingEmails, setIsSavingEmails] = useState(false)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)

  const fetchMessages = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/nachrichten?website=${website}&filter=${filter}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setCounts(data.counts || { total: 0, unread: 0, archived: 0 })
    } catch {
      toast.error('Fehler beim Laden der Nachrichten')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotificationEmails = async () => {
    if (!isLoaded) return
    try {
      const res = await fetch(`/api/settings?website=${website}`)
      const data = await res.json()
      const emailsStr = data.settings?.contact_notification_emails || ''
      if (emailsStr) {
        setNotificationEmails(emailsStr.split(',').map((e: string) => e.trim()).filter(Boolean))
      } else {
        setNotificationEmails([])
      }
    } catch {
      // Silently fail - not critical
    }
  }

  const saveNotificationEmails = async (emails: string[]) => {
    setIsSavingEmails(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          settings: {
            contact_notification_emails: emails.join(','),
          },
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('E-Mail-Empfänger gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingEmails(false)
    }
  }

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    if (!isValidEmail(email)) {
      toast.error('Ungültige E-Mail-Adresse')
      return
    }
    if (notificationEmails.includes(email)) {
      toast.error('E-Mail bereits hinzugefügt')
      return
    }
    const newEmails = [...notificationEmails, email]
    setNotificationEmails(newEmails)
    setEmailInput('')
    saveNotificationEmails(newEmails)
    emailInputRef.current?.focus()
  }

  const removeEmail = (emailToRemove: string) => {
    const newEmails = notificationEmails.filter((e) => e !== emailToRemove)
    setNotificationEmails(newEmails)
    saveNotificationEmails(newEmails)
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchNotificationEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website, isLoaded, filter])

  const handleOpenMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)

    // Mark as read if not already
    if (!message.read) {
      try {
        await fetch(`/api/nachrichten/${message.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        })
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
        )
        setCounts((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      } catch {
        // Ignore error
      }
    }
  }

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await fetch(`/api/nachrichten/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentRead }),
      })
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
      )
      setCounts((prev) => ({
        ...prev,
        unread: currentRead ? prev.unread + 1 : Math.max(0, prev.unread - 1),
      }))
      toast.success(currentRead ? 'Als ungelesen markiert' : 'Als gelesen markiert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    try {
      await fetch(`/api/nachrichten/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !currentArchived }),
      })
      // Remove from current list if filter doesn't match
      if (filter === 'archived' && currentArchived) {
        setMessages((prev) => prev.filter((m) => m.id !== id))
      } else if (filter !== 'archived' && !currentArchived) {
        setMessages((prev) => prev.filter((m) => m.id !== id))
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, archived: !currentArchived } : m))
        )
      }
      setCounts((prev) => ({
        ...prev,
        archived: currentArchived ? Math.max(0, prev.archived - 1) : prev.archived + 1,
      }))
      toast.success(currentArchived ? 'Aus Archiv entfernt' : 'Archiviert')
    } catch {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/nachrichten/${deleteId}`, { method: 'DELETE' })
      const deleted = messages.find((m) => m.id === deleteId)
      setMessages((prev) => prev.filter((m) => m.id !== deleteId))
      if (deleted) {
        setCounts((prev) => ({
          total: Math.max(0, prev.total - 1),
          unread: deleted.read ? prev.unread : Math.max(0, prev.unread - 1),
          archived: deleted.archived ? Math.max(0, prev.archived - 1) : prev.archived,
        }))
      }
      toast.success('Nachricht gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteId(null)
    }
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
        <div>
          <h1 className="text-2xl font-bold text-text-color">Nachrichten</h1>
          <p className="text-sm text-text-color/60 mt-1">
            Kontaktanfragen für {getDisplayName()}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowEmailSettings(!showEmailSettings)}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          E-Mail-Empfänger
        </Button>
      </div>

      {/* Email Settings Panel */}
      {showEmailSettings && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-text-color">E-Mail-Empfänger für Kontaktanfragen</h2>
          </div>
          <p className="text-sm text-text-color/60 mb-4">
            Diese E-Mail-Adressen erhalten Benachrichtigungen, wenn jemand das Kontaktformular ausfüllt.
          </p>

          {/* Email Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {notificationEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="hover:bg-secondary/20 rounded-full p-0.5 transition-colors"
                  disabled={isSavingEmails}
                  title="Entfernen"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {notificationEmails.length === 0 && (
              <span className="text-sm text-text-color/40 italic">
                Noch keine E-Mail-Empfänger konfiguriert
              </span>
            )}
          </div>

          {/* Add Email Input */}
          <div className="flex gap-2">
            <input
              ref={emailInputRef}
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              placeholder="E-Mail-Adresse eingeben..."
              className="flex-1 px-4 py-2 rounded-lg bg-light-grey text-text-color placeholder:text-text-color/40 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              disabled={isSavingEmails}
            />
            <Button
              onClick={addEmail}
              disabled={!emailInput.trim() || isSavingEmails}
            >
              {isSavingEmails ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Hinzufügen'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-secondary text-white'
              : 'bg-light-grey text-text-color hover:bg-light-grey/80'
          }`}
        >
          Alle ({counts.total - counts.archived})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-secondary text-white'
              : 'bg-light-grey text-text-color hover:bg-light-grey/80'
          }`}
        >
          Ungelesen ({counts.unread})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'archived'
              ? 'bg-secondary text-white'
              : 'bg-light-grey text-text-color hover:bg-light-grey/80'
          }`}
        >
          Archiv ({counts.archived})
        </button>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-text-color/60 mt-4">
            {filter === 'unread'
              ? 'Keine ungelesenen Nachrichten'
              : filter === 'archived'
              ? 'Keine archivierten Nachrichten'
              : 'Keine Nachrichten vorhanden'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-xl bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                !message.read ? 'ring-2 ring-secondary/20' : ''
              }`}
              onClick={() => handleOpenMessage(message)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!message.read && (
                      <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                    )}
                    <h3 className={`font-medium text-text-color truncate ${!message.read ? 'font-semibold' : ''}`}>
                      {message.name}
                    </h3>
                    {message.company && (
                      <span className="text-sm text-text-color/50">({message.company})</span>
                    )}
                  </div>
                  <p className="text-sm text-text-color/60 truncate mt-0.5">
                    {message.subject || message.email}
                  </p>
                  <p className="text-sm text-text-color/40 truncate mt-1">
                    {message.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-text-color/50">
                    {format(new Date(message.createdAt), 'dd.MM.yyyy', { locale: de })}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleRead(message.id, message.read)}
                      className="p-1.5 text-text-color/30 hover:text-secondary transition-colors"
                      title={message.read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
                    >
                      {message.read ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleArchive(message.id, message.archived)}
                      className="p-1.5 text-text-color/30 hover:text-yellow-600 transition-colors"
                      title={message.archived ? 'Aus Archiv entfernen' : 'Archivieren'}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteId(message.id)}
                      className="p-1.5 text-text-color/30 hover:text-red-600 transition-colors"
                      title="Löschen"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nachricht von {selectedMessage?.name}</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-color/60">Name:</span>
                  <p className="font-medium text-text-color">{selectedMessage.name}</p>
                </div>
                <div>
                  <span className="text-text-color/60">E-Mail:</span>
                  <p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-secondary hover:text-secondary/80">
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <span className="text-text-color/60">Telefon:</span>
                    <p>
                      <a href={`tel:${selectedMessage.phone}`} className="text-secondary hover:text-secondary/80">
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </div>
                )}
                {selectedMessage.company && (
                  <div>
                    <span className="text-text-color/60">Firma:</span>
                    <p className="text-text-color">{selectedMessage.company}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-text-color/60">Eingegangen:</span>
                  <p className="text-text-color">
                    {format(new Date(selectedMessage.createdAt), "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                  </p>
                </div>
              </div>

              {selectedMessage.subject && (
                <div>
                  <span className="text-sm text-text-color/60">Betreff:</span>
                  <p className="font-medium text-text-color">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-text-color/60">Nachricht:</span>
                <div className="mt-1 p-3 rounded-lg bg-light-grey text-text-color whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Ihre Anfrage'}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Antworten
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-text-color bg-light-grey rounded-lg hover:bg-light-grey/80 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Anrufen
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nachricht löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Nachricht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
