import { Metadata } from 'next'
import {
  FileText,
  Image,
  Newspaper,
  Briefcase,
  MessageSquare,
  Users,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard Übersicht',
}

const stats = [
  { label: 'Seiten', value: 0, icon: FileText, href: '/dashboard/seiten' },
  { label: 'Blog-Artikel', value: 0, icon: Newspaper, href: '/dashboard/blog' },
  { label: 'Medien', value: 0, icon: Image, href: '/dashboard/medien' },
  { label: 'Stellenangebote', value: 0, icon: Briefcase, href: '/dashboard/stellenangebote' },
  { label: 'Bewerbungen', value: 0, icon: Users, href: '/dashboard/bewerbungen' },
  { label: 'Nachrichten', value: 0, icon: MessageSquare, href: '/dashboard/nachrichten' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-secondary">Willkommen im Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Webseiten-Inhalte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary-50 text-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-highlight font-bold text-text-color">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg text-secondary mb-4">Letzte Aktivitäten</h2>
          <p className="text-muted-foreground text-sm">
            Keine Aktivitäten vorhanden.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg text-secondary mb-4">Schnellzugriff</h2>
          <div className="space-y-2">
            <a
              href="/dashboard/blog/neu"
              className="block p-3 rounded-lg bg-light-grey hover:bg-secondary-50 transition-colors text-sm"
            >
              + Neuen Blog-Artikel erstellen
            </a>
            <a
              href="/dashboard/seiten/neu"
              className="block p-3 rounded-lg bg-light-grey hover:bg-secondary-50 transition-colors text-sm"
            >
              + Neue Seite erstellen
            </a>
            <a
              href="/dashboard/stellenangebote/neu"
              className="block p-3 rounded-lg bg-light-grey hover:bg-secondary-50 transition-colors text-sm"
            >
              + Neues Stellenangebot erstellen
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
