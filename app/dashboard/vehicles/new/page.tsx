import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { VehicleForm } from '@/components/vehicles/vehicle-form'

async function getCustomers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('customers')
    .select('id, name')
    .order('name')

  return data || []
}

export default async function NewVehiclePage() {
  const customers = await getCustomers()

  return (
    <>
      <DashboardHeader
        title="Add Vehicle"
        description="Register a new vehicle"
      />

      <main className="flex-1 p-6">
        <VehicleForm customers={customers} />
      </main>
    </>
  )
}
