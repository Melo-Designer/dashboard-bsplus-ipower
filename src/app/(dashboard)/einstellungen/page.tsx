'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/components/dashboard/WebsiteSelector'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { SETTING_GROUPS, SettingDefinition } from '@/lib/constants/settings'

export default function SettingsPage() {
  const { website, setWebsite, getDisplayName, isLoaded } = useWebsite()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      if (!isLoaded) return

      setIsLoading(true)
      try {
        const res = await fetch(`/api/settings?website=${website}`)
        const data = await res.json()
        setSettings(data.settings || {})
      } catch {
        toast.error('Fehler beim Laden der Einstellungen')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [website, isLoaded])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website, settings }),
      })

      if (!res.ok) throw new Error()

      toast.success('Einstellungen gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-secondary">Einstellungen</h1>
          <p className="text-text-color/60 mt-1">
            Konfigurieren Sie die Einstellungen für {getDisplayName()}
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={website} onValueChange={(v) => setWebsite(v as 'bs_plus' | 'ipower')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bs_plus">BS Plus</SelectItem>
              <SelectItem value="ipower">iPower</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <div key={group.title} className="rounded-xl bg-light-grey p-6">
            <h2 className="text-lg font-highlight font-bold text-secondary">
              {group.title}
            </h2>
            {group.description && (
              <p className="text-sm text-text-color/60 mt-1">{group.description}</p>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {group.settings.map((setting) => (
                <SettingField
                  key={setting.key}
                  setting={setting}
                  value={settings[setting.key] || ''}
                  onChange={(value) => handleChange(setting.key, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky save button for mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          variant="secondary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}

interface SettingFieldProps {
  setting: SettingDefinition
  value: string
  onChange: (value: string) => void
}

function SettingField({ setting, value, onChange }: SettingFieldProps) {
  const id = `setting-${setting.key}`

  return (
    <div className={setting.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <Label htmlFor={id}>{setting.label}</Label>
      {setting.description && (
        <p className="text-xs text-text-color/50 mt-0.5">{setting.description}</p>
      )}

      {setting.type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={setting.placeholder}
          rows={3}
          className="mt-1.5"
        />
      ) : (
        <Input
          id={id}
          type={setting.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={setting.placeholder}
          className="mt-1.5"
        />
      )}
    </div>
  )
}
