import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { MechanicJobsTable } from '@/components/mechanic/mechanic-jobs-table'

async function getMechanicJobs(userId: string) {
  const supabase = await createClient()

  // Get mechanic record
  const { data: mechanic } = await supabase
    .from('mechanics')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (!mechanic) return []

  const { data, error } = await supabase
    .from('job_cards')
    .select(`
      *,
      customer:customers(id, name, phone),
      vehicle:vehicles(id, make, model, license_plate, year)
    `)
    .eq('mechanic_id', mechanic.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return data || []
}

export default async function MechanicJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const jobs = user ? await getMechanicJobs(user.id) : []

  return (
    <>
      <DashboardHeader
        title="My Jobs"
        description="View and manage your assigned jobs"
      />

      <main className="flex-1 space-y-6 p-6">
        <MechanicJobsTable jobs={jobs} />
      </main>
    </>
  )
}
