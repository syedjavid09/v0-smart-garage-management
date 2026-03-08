import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { ServicesTable } from '@/components/services/services-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <DashboardHeader
        title="Services"
        description="Manage your service offerings"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {services.length} services available
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>

        <ServicesTable services={services} />
      </main>
    </>
  )
}
