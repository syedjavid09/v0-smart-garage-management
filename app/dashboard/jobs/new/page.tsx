import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { JobForm } from '@/components/jobs/job-form'

async function getData() {
  const supabase = await createClient()
  
  const [customersResult, vehiclesResult, mechanicsResult, servicesResult] = await Promise.all([
    supabase.from('customers').select('id, name').order('name'),
    supabase.from('vehicles').select('id, make, model, license_plate, year, customer_id').order('make'),
    supabase.from('mechanics').select('id, profile:profiles(full_name), is_available').eq('is_available', true),
    supabase.from('services').select('id, name, base_price, estimated_hours').eq('is_active', true).order('name'),
  ])

  return {
    customers: customersResult.data || [],
    vehicles: vehiclesResult.data || [],
    mechanics: mechanicsResult.data || [],
    services: servicesResult.data || [],
  }
}

export default async function NewJobPage() {
  const { customers, vehicles, mechanics, services } = await getData()

  return (
    <>
      <DashboardHeader
        title="New Job Card"
        description="Create a new service order"
      />

      <main className="flex-1 p-6">
        <JobForm
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          services={services}
        />
      </main>
    </>
  )
}
