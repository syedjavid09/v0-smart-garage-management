import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { VehiclesTable } from '@/components/vehicles/vehicles-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getVehicles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      customer:customers(id, name, phone)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }

  return data || []
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles()

  return (
    <>
      <DashboardHeader
        title="Vehicles"
        description="Manage registered vehicles"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {vehicles.length} vehicles registered
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>

        <VehiclesTable vehicles={vehicles} />
      </main>
    </>
  )
}
