export const EMPLOYMENT_TYPES = [
  { value: 'vollzeit', label: 'Vollzeit' },
  { value: 'teilzeit', label: 'Teilzeit' },
  { value: 'ausbildung', label: 'Ausbildung' },
  { value: 'praktikum', label: 'Praktikum' },
  { value: 'werkstudent', label: 'Werkstudent' },
  { value: 'minijob', label: 'Minijob' },
  { value: 'freiberuflich', label: 'Freiberuflich' },
] as const

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'Neu eingegangen', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'In Prüfung', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'interviewed', label: 'Interview durchgeführt', color: 'bg-purple-100 text-purple-700' },
  { value: 'accepted', label: 'Angenommen', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Abgelehnt', color: 'bg-red-100 text-red-700' },
] as const

export const JOB_STATUSES = [
  { value: 'draft', label: 'Entwurf', color: 'bg-gray-100 text-gray-700' },
  { value: 'published', label: 'Veröffentlicht', color: 'bg-green-100 text-green-700' },
  { value: 'archived', label: 'Archiviert', color: 'bg-orange-100 text-orange-700' },
] as const
