import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { SliderManagement } from '@/components/dashboard/homepage/SliderManagement'
import { SectionManagement } from '@/components/dashboard/homepage/SectionManagement'

export const metadata: Metadata = {
  title: 'Startseite - Dashboard',
}

export default function HomepagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-secondary">Startseite</h1>
        <p className="text-text-color/60 mt-1">
          Verwalten Sie die Inhalte Ihrer Startseite
        </p>
      </div>

      <Tabs defaultValue="slider" className="w-full">
        <TabsList>
          <TabsTrigger value="slider">Slider</TabsTrigger>
          <TabsTrigger value="sections">Abschnitte</TabsTrigger>
        </TabsList>

        <TabsContent value="slider" className="mt-6">
          <SliderManagement />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <SectionManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
